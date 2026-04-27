const db = require('../../config/db');

// Cari user berdasarkan email
async function  fetUserByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null; 
}

// Cari user berdasarkan ID
async function getUserById(id) {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null; 
}

// Buat user baru, return ID user yang baru dibuat
async function createUser(data) {
    const { nama, email, password, oauth_provider, oauth_id, role} = data;
       const [result] = await db.execute(
        'INSERT INTO users (nama, email, password, oauth_provider, oauth_id, role) VALUES (?, ?, ?, ?, ?, ?)',
        [nama, email, password || null, oauth_provider || 'local', oauth_id || null, role || 'mahasiswa']
    );
    return result.insertId;
}

// Cari user oauth biar ga duplicate
async function getUserByOauth(provider, oauthId) {
    const [rows] = await db.execute(
        'SELECT * FROM users WHERE oauth_provider = ? AND oauth_id = ?',
        [provider, oauthId]
    );
    return rows[0] || null; 
}

module.exports = { getUserByEmail, getUserById, createUser, getUserByOAuth };
