import crypto from 'node:crypto';

const SAWERIA_URL = process.env.SAWERIA_URL || 'https://saweria.co/Shuttleflash';
const SAWERIA_STREAM_KEY = process.env.SAWERIA_STREAM_KEY || '';
const MIN_DONATION = Number(process.env.MIN_DONATION || 5000);
const SESSION_TTL_SECONDS = Number(process.env.HD_SESSION_TTL_SECONDS || 2 * 60 * 60);
const ACCESS_CODE_PATTERN = /SFHD-[A-Z0-9]{6,12}/i;
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || '';
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || '';

const memoryStore = globalThis.__shuttleflashStore || {
  sessions: new Map(),
  donationIds: new Set()
};
globalThis.__shuttleflashStore = memoryStore;

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(data));
}

function isRedisEnabled() {
  return Boolean(REDIS_URL && REDIS_TOKEN);
}

async function redis(command) {
  const response = await fetch(REDIS_URL, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${REDIS_TOKEN}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify(command)
  });
  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error || 'Redis request gagal');
  }
  return data.result;
}

function sessionKey(code) {
  return `sfhd:session:${code}`;
}

function donationKey(donationId) {
  return `sfhd:donation:${donationId}`;
}

async function saveSession(code, session) {
  if (isRedisEnabled()) {
    await redis(['SET', sessionKey(code), JSON.stringify(session), 'EX', SESSION_TTL_SECONDS]);
    return;
  }
  memoryStore.sessions.set(code, session);
}

async function getSession(code) {
  if (isRedisEnabled()) {
    const session = await redis(['GET', sessionKey(code)]);
    return session ? JSON.parse(session) : null;
  }
  const session = memoryStore.sessions.get(code);
  if (session && session.expiresAt <= Date.now()) {
    memoryStore.sessions.delete(code);
    return null;
  }
  return session || null;
}

async function markDonationSeen(donationId) {
  if (!donationId) return false;
  if (isRedisEnabled()) {
    const created = await redis(['SET', donationKey(donationId), '1', 'NX', 'EX', SESSION_TTL_SECONDS]);
    return created !== 'OK';
  }
  if (memoryStore.donationIds.has(donationId)) {
    return true;
  }
  memoryStore.donationIds.add(donationId);
  return false;
}

async function readRawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body);
  if (req.body && typeof req.body === 'object') return Buffer.from(JSON.stringify(req.body));

  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', chunk => {
      size += chunk.length;
      if (size > 1024 * 1024) {
        reject(new Error('Body terlalu besar'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function parseJson(rawBody) {
  if (!rawBody.length) return {};
  return JSON.parse(rawBody.toString('utf8'));
}

function generateAccessCode() {
  return `SFHD-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

function collectStrings(value, result = []) {
  if (typeof value === 'string') {
    result.push(value);
    return result;
  }
  if (Array.isArray(value)) {
    value.forEach(item => collectStrings(item, result));
    return result;
  }
  if (value && typeof value === 'object') {
    Object.values(value).forEach(item => collectStrings(item, result));
  }
  return result;
}

function getDonationAmount(payload) {
  const candidates = [
    payload.amount_raw,
    payload.amount,
    payload.price,
    payload.value,
    payload.data?.amount_raw,
    payload.data?.amount,
    payload.data?.price
  ];
  for (const candidate of candidates) {
    const amount = Number(String(candidate ?? '').replace(/[^\d]/g, ''));
    if (Number.isFinite(amount) && amount > 0) {
      return amount;
    }
  }
  return 0;
}

function getDonationId(payload) {
  return String(payload.id || payload.transaction_id || payload.data?.id || payload.data?.transaction_id || '');
}

function getAccessCodeFromPayload(payload) {
  const text = collectStrings(payload).join(' ');
  const match = text.match(ACCESS_CODE_PATTERN);
  return match ? match[0].toUpperCase() : '';
}

function safeEqualHex(a, b) {
  if (!a || !b) return false;
  const cleanA = String(a).trim().toLowerCase();
  const cleanB = String(b).trim().toLowerCase();
  if (!/^[a-f0-9]+$/.test(cleanA) || !/^[a-f0-9]+$/.test(cleanB)) return false;
  const bufferA = Buffer.from(cleanA, 'hex');
  const bufferB = Buffer.from(cleanB, 'hex');
  return bufferA.length === bufferB.length && crypto.timingSafeEqual(bufferA, bufferB);
}

function verifySaweriaSignature(req, rawBody, payload) {
  if (!SAWERIA_STREAM_KEY) {
    return process.env.NODE_ENV !== 'production';
  }

  const signature =
    req.headers['saweria-callback-signature'] ||
    req.headers['x-saweria-signature'] ||
    req.headers['x-signature'];

  const rawExpected = crypto
    .createHmac('sha256', SAWERIA_STREAM_KEY)
    .update(rawBody)
    .digest('hex');

  const fieldMessage = [
    payload.version,
    payload.id,
    payload.amount_raw,
    payload.donator_name,
    payload.donator_email
  ].join('');

  const fieldExpected = crypto
    .createHmac('sha256', SAWERIA_STREAM_KEY)
    .update(fieldMessage)
    .digest('hex');

  return safeEqualHex(rawExpected, signature) || safeEqualHex(fieldExpected, signature);
}

function getApiPath(req) {
  const url = new URL(req.url || '/', `https://${req.headers.host || 'localhost'}`);
  const parts = url.pathname.split('/').filter(Boolean);
  const apiIndex = parts.indexOf('api');
  const action = apiIndex >= 0 ? parts[apiIndex + 1] : parts[0];
  return { action, url };
}

async function createHdSession(req, res) {
  const rawBody = await readRawBody(req);
  const body = parseJson(rawBody);
  const court = String(body.court || '');
  if (!/^court[1-4]hd$/.test(court)) {
    return sendJson(res, 400, { error: 'Court HD tidak valid' });
  }

  let code = generateAccessCode();
  while (await getSession(code)) {
    code = generateAccessCode();
  }

  const now = Date.now();
  const session = {
    court,
    paid: false,
    createdAt: now,
    expiresAt: now + SESSION_TTL_SECONDS * 1000
  };
  await saveSession(code, session);

  return sendJson(res, 200, {
    code,
    court,
    minDonation: MIN_DONATION,
    saweriaUrl: SAWERIA_URL,
    storage: isRedisEnabled() ? 'redis' : 'memory'
  });
}

async function checkHdAccess(res, url) {
  const code = String(url.searchParams.get('code') || '').toUpperCase();
  const court = String(url.searchParams.get('court') || '');
  const session = await getSession(code);
  return sendJson(res, 200, {
    unlocked: Boolean(session && session.paid && session.court === court),
    court: session?.court || '',
    expiresAt: session?.expiresAt || 0,
    storage: isRedisEnabled() ? 'redis' : 'memory'
  });
}

async function receiveSaweriaWebhook(req, res) {
  const rawBody = await readRawBody(req);
  const payload = parseJson(rawBody);

  if (!verifySaweriaSignature(req, rawBody, payload)) {
    return sendJson(res, 401, { error: 'Signature webhook tidak valid' });
  }

  const donationId = getDonationId(payload);
  const duplicate = await markDonationSeen(donationId);
  if (duplicate) {
    return sendJson(res, 200, { ok: true, duplicate: true });
  }

  const code = getAccessCodeFromPayload(payload);
  const amount = getDonationAmount(payload);
  const session = await getSession(code);

  if (!session) {
    return sendJson(res, 200, { ok: true, matched: false, reason: 'Kode akses tidak ditemukan' });
  }
  if (amount < MIN_DONATION) {
    return sendJson(res, 200, { ok: true, matched: true, unlocked: false, reason: 'Nominal belum cukup' });
  }

  const updatedSession = {
    ...session,
    paid: true,
    amount,
    donationId,
    paidAt: Date.now()
  };
  await saveSession(code, updatedSession);

  return sendJson(res, 200, { ok: true, matched: true, unlocked: true });
}

export default async function handler(req, res) {
  try {
    const { action, url } = getApiPath(req);

    if (req.method === 'POST' && action === 'hd-session') {
      return await createHdSession(req, res);
    }
    if (req.method === 'GET' && action === 'hd-access') {
      return await checkHdAccess(res, url);
    }
    if (req.method === 'POST' && action === 'saweria-webhook') {
      return await receiveSaweriaWebhook(req, res);
    }

    return sendJson(res, 404, { error: 'Endpoint tidak ditemukan' });
  } catch (error) {
    return sendJson(res, 500, { error: error.message || 'Server error' });
  }
}
