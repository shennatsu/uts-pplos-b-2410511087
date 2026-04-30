const jwt = require('jsonwebtoken');

// middleware untuk endpoint yang butuh login
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token tidak ada' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token tidak valid atau expired' });
    }
};

// middleware khusus untuk internal request dari pengaduan-service
const internalMiddleware = (req, res, next) => {
    const secret = req.headers['x-internal-secret'];

    if (!secret || secret !== process.env.INTERNAL_SECRET) {
        return res.status(403).json({ message: 'Akses tidak diizinkan' });
    }

    next();
};

module.exports = { authMiddleware, internalMiddleware };