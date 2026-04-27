const db = require('../config/db');

// cari user berdasarkan email
async function getUserByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
}

// cari user berdasarkan id
async function getUserById(id) {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null;
}

// buat user baru, return id yang baru dibuat
async function createUser(data) {
    const { nama, email, password, oauth_provider, oauth_id, role } = data;
    const [result] = await db.execute(
        'INSERT INTO users (nama, email, password, oauth_provider, oauth_id, role) VALUES (?, ?, ?, ?, ?, ?)',
        [nama, email, password || null, oauth_provider || 'local', oauth_id || null, role || 'mahasiswa']
    );
    return result.insertId;
}

// cari user oauth biar ga duplicate
async function getUserByOAuth(provider, providerId) {
    const [rows] = await db.execute(
        'SELECT * FROM users WHERE oauth_provider = ? AND oauth_id = ?',
        [provider, providerId]
    );
    return rows[0] || null;
}

module.exports = { getUserByEmail, getUserById, createUser, getUserByOAuth };