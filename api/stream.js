const { encryptUrl } = require('./crypto');

export default function handler(req, res) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.status(204)
           .setHeader('Access-Control-Allow-Origin', '*')
           .setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
           .setHeader('Access-Control-Allow-Headers', 'Content-Type')
           .setHeader('Access-Control-Max-Age', '86400')
           .end();
        return;
    }

    const { court } = req.query;

    const COURTS = {
        court1: process.env.COURT1_URL,
        court2: process.env.COURT2_URL,
        court3: process.env.COURT3_URL,
        court4: process.env.COURT4_URL
    };

    const courtUrl = COURTS[court];

    res.setHeader('Access-Control-Allow-Origin', '*');

    if (courtUrl) {
        // req.headers.host contains the host (e.g. localhost:3000 or your-vercel-app.vercel.app)
        const host = req.headers.host;
        // determine protocol
        const protocol = req.headers['x-forwarded-proto'] || 'http';
        
        res.status(200).json({ 
            url: `${protocol}://${host}/api/proxy?q=${encryptUrl(courtUrl)}` 
        });
    } else {
        res.status(404).json({ error: 'Stream not found' });
    }
}
