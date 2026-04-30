const { simpanNotifikasi, getNotifikasiByUser, tandaiDibaca } = require('../models/NotifikasiModel');

// POST /notifikasi — dipanggil oleh pengaduan-service
const kirimNotifikasi = async (req, res) => {
    try {
        const { user_id, judul, pesan, tipe } = req.body;

        if (!user_id || !judul || !pesan) {
            return res.status(400).json({ message: 'user_id, judul, dan pesan wajib diisi' });
        }

        const id = await simpanNotifikasi({ user_id, judul, pesan, tipe });

        res.status(201).json({ message: 'Notifikasi berhasil dikirim', id });
    } catch (err) {
        console.error('Error kirim notifikasi:', err);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};

// GET /notifikasi/:userId — list notifikasi milik user
const getNotifikasi = async (req, res) => {
    try {
        const userId = req.params.userId;

        // pastikan user hanya bisa lihat punya sendiri
        if (parseInt(userId) !== req.user.id) {
            return res.status(403).json({ message: 'Tidak boleh akses notifikasi user lain' });
        }

        const data = await getNotifikasiByUser(userId);

        res.json({ message: 'OK', data });
    } catch (err) {
        console.error('Error get notifikasi:', err.message);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};

// PUT /notifikasi/:id/read — tandai sudah dibaca
const bacaNotifikasi = async (req, res) => {
    try {
        const notifikasiId = req.params.id;
        const userId = req.user.id;

        const berhasil = await tandaiDibaca(notifikasiId, userId);

        if (!berhasil) {
            return res.status(404).json({ message: 'Notifikasi tidak ditemukan' });
        }

        res.json({ message: 'Notifikasi ditandai sudah dibaca' });
    } catch (err) {
        console.error('Error baca notifikasi:', err.message);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};

module.exports = { kirimNotifikasi, getNotifikasi, bacaNotifikasi };