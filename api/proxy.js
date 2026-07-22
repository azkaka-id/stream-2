const { encryptUrl, decryptUrl } = require('./crypto');
const { Readable } = require('stream');

function rewritePlaylist(playlist, baseUrl, requestHost, protocol) {
    return playlist.split(/\r?\n/).map(line => {
        const trimmed = line.trim();
        if (!trimmed) return line;
        
        if (trimmed.startsWith('#')) {
            return line.replace(/URI="([^"]+)"/g, (match, uri) => {
                const absUrl = new URL(uri, baseUrl).href;
                return `URI="${protocol}://${requestHost}/api/proxy?q=${encryptUrl(absUrl)}"`;
            });
        }
        
        const absUrl = new URL(trimmed, baseUrl).href;
        return `${protocol}://${requestHost}/api/proxy?q=${encryptUrl(absUrl)}`;
    }).join('\n');
}

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.status(204)
           .setHeader('Access-Control-Allow-Origin', '*')
           .setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
           .setHeader('Access-Control-Allow-Headers', 'Content-Type')
           .setHeader('Access-Control-Max-Age', '86400')
           .end();
        return;
    }

    const { q } = req.query;
    
    if (!q) {
        return res.status(400).send('Missing query parameter');
    }

    const targetUrl = decryptUrl(q);
    if (!targetUrl) {
        return res.status(400).send('Invalid URL');
    }

    try {
        const upstream = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': '*/*'
            },
            cache: 'no-store'
        });
        
        const contentType = upstream.headers.get('content-type') || '';
        const host = req.headers.host;
        const protocol = req.headers['x-forwarded-proto'] || 'http';

        if (contentType.includes('mpegurl') || targetUrl.includes('.m3u8')) {
            const text = await upstream.text();
            const rewritten = rewritePlaylist(text, targetUrl, host, protocol);
            
            res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.status(upstream.status).send(rewritten);
            return;
        }

        res.setHeader('Content-Type', contentType || 'video/MP2T');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(upstream.status);

        if (upstream.body) {
            Readable.fromWeb(upstream.body).on('error', () => {}).pipe(res);
        } else {
            res.end();
        }
    } catch (err) {
        console.error('Proxy error:', err);
        res.status(502).end();
    }
}
