const db = require('../config/db');

// Pas masukin token ke blacklist pas logout
async function blacklistToken(token) {
    await db.execute('INSERT INTO token_blacklist (token) VALUES (?)', [token]);
}

// Cek apakah token ada di blacklist
async function isTokenBlacklisted(token) {
    const [rows] = await db.execute('SELECT * FROM token_blacklist WHERE token = ?', [token]);
    return rows.length > 0; 
}

module.exports = { blacklistToken, isTokenBlacklisted };