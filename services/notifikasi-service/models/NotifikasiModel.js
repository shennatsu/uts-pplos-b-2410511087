const db = require('../config/db');

// simpan notifikasi baru
async function simpanNotifikasi(data) {
    const { user_id, judul, pesan, tipe } = data;
    const [result] = await db.execute(
        'INSERT INTO notifikasi (user_id, judul, pesan, tipe) VALUES (?, ?, ?, ?)',
        [user_id, judul, pesan, tipe || 'pengaduan_baru']
    );

    // buat status baca untuk user ini
    await db.execute(
        'INSERT INTO status_baca (notifikasi_id, user_id, dibaca) VALUES (?, ?, 0)',
        [result.insertId, user_id]
    );

    return result.insertId;
}

// ambil semua notifikasi milik user
async function getNotifikasiByUser(userId) {
    const [rows] = await db.execute(
        `SELECT n.*, sb.dibaca, sb.dibaca_at 
         FROM notifikasi n
         LEFT JOIN status_baca sb ON n.id = sb.notifikasi_id AND sb.user_id = ?
         WHERE n.user_id = ?
         ORDER BY n.created_at DESC`,
        [userId, userId]
    );
    return rows;
}

// nandain udah dibaca
async function tandaiDibaca(notifikasiId, userId) {
    const [result] = await db.execute(
        'UPDATE status_baca SET dibaca = 1, dibaca_at = NOW() WHERE notifikasi_id = ? AND user_id = ?',
        [notifikasiId, userId]
    );
    return result.affectedRows > 0;
}

module.exports = { simpanNotifikasi, getNotifikasiByUser, tandaiDibaca };