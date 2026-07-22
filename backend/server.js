const fs = require('fs');
const http = require('http');
const path = require('path');
const { Readable } = require('stream');
const crypto = require('crypto');

// Kunci rahasia dibuat otomatis dan acak di memori setiap kali server menyala
const SECRET_KEY = crypto.randomBytes(32);

function encryptUrl(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', SECRET_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

function decryptUrl(text) {
    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', SECRET_KEY, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (e) {
        return null;
    }
}

// Membaca file .env
function loadEnvFile() {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) return;
    fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const sepIdx = trimmed.indexOf('=');
        if (sepIdx !== -1) {
            const key = trimmed.slice(0, sepIdx).trim();
            const val = trimmed.slice(sepIdx + 1).trim().replace(/^["']|["']$/g, '');
            if (key && process.env[key] === undefined) process.env[key] = val;
        }
    });
}

loadEnvFile();

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0'; // Diubah ke 0.0.0.0 agar bisa diakses publik setelah deploy
const FRONTEND_URL = process.env.FRONTEND_URL || '*'; // Mengatur domain frontend yang diizinkan

const COURTS = {
    court1: process.env.COURT1_URL,
    court2: process.env.COURT2_URL,
    court3: process.env.COURT3_URL,
    court4: process.env.COURT4_URL
};

// Fungsi untuk menyembunyikan link di dalam file m3u8
function rewritePlaylist(playlist, baseUrl, requestHost) {
    return playlist.split(/\r?\n/).map(line => {
        const trimmed = line.trim();
        if (!trimmed) return line;
        
        if (trimmed.startsWith('#')) {
            return line.replace(/URI="([^"]+)"/g, (match, uri) => {
                const absUrl = new URL(uri, baseUrl).href;
                return `URI="http://${requestHost}/proxy?q=${encryptUrl(absUrl)}"`;
            });
        }
        
        const absUrl = new URL(trimmed, baseUrl).href;
        return `http://${requestHost}/proxy?q=${encryptUrl(absUrl)}`;
    }).join('\n');
}

// Mesin Proxy Utama
async function handleProxy(targetUrl, req, res) {
    try {
        const upstream = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': '*/*'
            },
            cache: 'no-store'
        });
        const contentType = upstream.headers.get('content-type') || '';
        
        if (contentType.includes('mpegurl') || targetUrl.includes('.m3u8')) {
            const text = await upstream.text();
            const rewritten = rewritePlaylist(text, targetUrl, req.headers.host);
            res.writeHead(upstream.status, {
                'Content-Type': 'application/vnd.apple.mpegurl',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Access-Control-Allow-Origin': FRONTEND_URL
            });
            return res.end(rewritten);
        }
        res.writeHead(upstream.status, {
            'Content-Type': contentType || 'video/MP2T',
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': FRONTEND_URL
        });
        if (upstream.body) {
            Readable.fromWeb(upstream.body).on('error', () => {}).pipe(res);
        } else {
            res.end();
        }
    } catch (err) {
        res.writeHead(502);
        res.end();
    }
}

// Server Utama
const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    // Handle Preflight request untuk CORS
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': FRONTEND_URL,
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400'
        });
        return res.end();
    }

    if (req.method === 'GET') {
        // Endpoint Jadwal Pertandingan
        if (pathname === '/schedule.json') {
            return fs.readFile(path.join(__dirname, 'schedule.json'), (err, data) => {
                res.writeHead(err ? 404 : 200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': FRONTEND_URL
                });
                res.end(err ? '{}' : data);
            });
        }
        
        // Endpoint API Stream
        if (pathname.startsWith('/api/stream/')) {
            const court = pathname.split('/')[3];
            const courtUrl = COURTS[court];
            if (courtUrl) {
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': FRONTEND_URL
                });
                res.end(JSON.stringify({ url: `http://${req.headers.host}/proxy?q=${encryptUrl(courtUrl)}` }));
            } else {
                res.writeHead(404, { 'Access-Control-Allow-Origin': FRONTEND_URL }); 
                res.end('{"error":"Stream not found"}');
            }
            return;
        }

        // Endpoint Proxy m3u8/TS
        if (pathname === '/proxy') {
            const encryptedUrl = url.searchParams.get('q');
            if (encryptedUrl) {
                const targetUrl = decryptUrl(encryptedUrl);
                if (targetUrl) return await handleProxy(targetUrl, req, res);
            }
        }
    }
    
    res.writeHead(404);
    res.end('Not found');
});

server.listen(PORT, HOST, () => {
    console.log(`Server Backend jalan di http://${HOST}:${PORT}`);
});