const rateLimit = require('express-rate-limit');

// max 60 request per menit per IP
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 menit
    max: 60,
    message: {
        message: 'Terlalu banyak request, coba lagi dalam 1 menit'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = limiter;