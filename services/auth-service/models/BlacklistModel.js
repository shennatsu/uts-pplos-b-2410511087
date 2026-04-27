const db = require('../config/db');

// Pas masukin token ke blacklist pas logout
async function blacklistToken(token) {
    await db.execute('INSERT INTO blacklisted_tokens (token) VALUES (?)', [token]);
}

// Cek apakah token ada di blacklist
async function isTokenBlacklisted(token) {
    const [rows] = await db.execute('SELECT * FROM blacklisted_tokens WHERE token = ?', [token]);
    return rows.length > 0; 
}

module.exports = { blacklistToken, isTokenBlacklisted };