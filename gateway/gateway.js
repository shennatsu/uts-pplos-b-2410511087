require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const jwtValidate = require('./middleware/jwtValidate');
const rateLimiter = require('./middleware/rateLimiter');

const app = express();
app.use(cors());

// rate limiting dulu sebelum apapun
app.use(rateLimiter);

// validasi JWT sebelum diteruskan ke service
app.use(jwtValidate);

// health check gateway sendiri
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'api-gateway',
        port: process.env.PORT,
        routes: {
            '/auth/*'       : process.env.AUTH_SERVICE,
            '/pengaduan/*'  : process.env.PENGADUAN_SERVICE,
            '/notifikasi/*' : process.env.NOTIFIKASI_SERVICE,
        }
    });
});

// routing ke auth-service (port 3001)
app.use('/auth', createProxyMiddleware({
    target: process.env.AUTH_SERVICE,
    changeOrigin: true,
    // /auth/login → /auth/login (ga perlu rewrite, path tetap)
    on: {
        error: (err, req, res) => {
            res.status(502).json({ message: 'Auth service tidak bisa diakses' });
        }
    }
}));

// routing ke pengaduan-service (port 3002)
app.use('/pengaduan', createProxyMiddleware({
    target: process.env.PENGADUAN_SERVICE,
    changeOrigin: true,
    pathRewrite: { '^/pengaduan': '/api/pengaduan' },
    on: {
        error: (err, req, res) => {
            res.status(502).json({ message: 'Pengaduan service tidak bisa diakses' });
        }
    }
}));

// routing ke notifikasi-service (port 3003)
app.use('/notifikasi', createProxyMiddleware({
    target: process.env.NOTIFIKASI_SERVICE,
    changeOrigin: true,
    pathRewrite: { '^/notifikasi': '/notifikasi' },
    on: {
        error: (err, req, res) => {
            res.status(502).json({ message: 'Notifikasi service tidak bisa diakses' });
        }
    }
}));

// disposisi juga ke pengaduan-service
app.use('/disposisi', createProxyMiddleware({
    target: process.env.PENGADUAN_SERVICE,
    changeOrigin: true,
    pathRewrite: { '^/disposisi': '/api/disposisi' },
    on: {
        error: (err, req, res) => {
            res.status(502).json({ message: 'Pengaduan service tidak bisa diakses' });
        }
    }
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API Gateway jalan di port ${PORT}`);
    console.log(`Auth Service    → ${process.env.AUTH_SERVICE}`);
    console.log(`Pengaduan       → ${process.env.PENGADUAN_SERVICE}`);
    console.log(`Notifikasi      → ${process.env.NOTIFIKASI_SERVICE}`);
});