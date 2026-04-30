const rateLimit = require('express-rate-limit');

// max 60 request per menit per IP
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: {
        message: 'Terlalu banyak request, coba lagi 1 menit lagi'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = limiter;