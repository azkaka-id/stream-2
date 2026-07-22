const crypto = require('crypto');

// Use a static SECRET_KEY from env, fallback to a 32-char string if not set (ONLY FOR DEV!)
// In production, MUST set SECRET_KEY in Vercel dashboard.
const secretKeyStr = process.env.SECRET_KEY || 'default_secret_key_change_me_now!!';
const SECRET_KEY = Buffer.from(secretKeyStr.padEnd(32, '0').slice(0, 32), 'utf8');

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

module.exports = { encryptUrl, decryptUrl };
