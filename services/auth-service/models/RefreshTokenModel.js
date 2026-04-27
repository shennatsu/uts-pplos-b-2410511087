const db = require('../config/db');

async function simpanRefreshToken(userId, token, expiredAt) {
    await db.execute(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [userId, token, expiredAt]
    );
}

async function cariRefreshToken(token) {
    const [rows] = await db.execute(
        'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()',
        [token]
    );
    return rows[0] || null;
}

async function hapusRefreshToken(token) {
    await db.execute('DELETE FROM refresh_tokens WHERE token = ?', [token]);
}

module.exports = { simpanRefreshToken, cariRefreshToken, hapusRefreshToken };