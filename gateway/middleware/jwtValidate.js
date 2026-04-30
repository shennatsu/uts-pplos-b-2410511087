const jwt = require('jsonwebtoken');

// route yang boleh diakses tanpa token
const publicRoutes = [
    { path: '/auth/register', method: 'POST' },
    { path: '/auth/login', method: 'POST' },
    { path: '/auth/refresh', method: 'POST' },
    { path: '/auth/github', method: 'GET' },
    { path: '/auth/github/callback', method: 'GET' },
    { path: '/auth/github/failed', method: 'GET' },
];

const jwtValidate = (req, res, next) => {
    // cek apakah route ini public
    const isPublic = publicRoutes.some(route =>
        req.path.startsWith(route.path) && req.method === route.method
    );

    if (isPublic) return next();

    // cek token
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token tidak ada, akses ditolak' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token tidak valid atau sudah expired' });
    }
};

module.exports = jwtValidate;