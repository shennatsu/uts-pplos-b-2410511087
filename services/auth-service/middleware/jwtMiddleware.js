const jwt = require('jsonwebtoken');
const { isTokenBlacklisted } = require('../models/BlacklistModel');

// middleware ini dipasang di route yang butuh login
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token tidak ada, akses ditolak' });
    }

    const token = authHeader.split(' ')[1];

    // cek token udah di logout belum
    const sudahLogout = await isTokenBlacklisted(token);
    if (sudahLogout) {
        return res.status(401).json({ message: 'Token sudah tidak berlaku' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // simpan info user di request
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token tidak valid atau sudah expired' });
    }
};

module.exports = authMiddleware;