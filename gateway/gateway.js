require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const jwtValidate = require('./middleware/jwtValidate');
const rateLimiter = require('./middleware/rateLimiter');

const app = express();
app.use(cors());

// rate limiting ke semua route
app.use(rateLimiter);

// validasi JWT sebelum diteruskan
app.use(jwtValidate);

// health check gateway sendiri
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'api-gateway',
        port: process.env.PORT,
        routes: {
            auth: process.env.AUTH_SERVICE,
            pengaduan: process.env.PENGADUAN_SERVICE,
            notifikasi: process.env.NOTIFIKASI_SERVICE
        }
    });
});

// routing ke auth-service (port 3001)
app.use('/auth', createProxyMiddleware({
    target: process.env.AUTH_SERVICE,
    changeOrigin: true,
    pathRewrite: { '^/': '/auth/' },
    on: {
        error: (err, req, res) => {
            res.status(503).json({ message: 'Auth service tidak tersedia' });
        }
    }
}));

// routing ke pengaduan-service (port 3002)
app.use('/pengaduan', createProxyMiddleware({
    target: process.env.PENGADUAN_SERVICE,
    changeOrigin: true,
    pathRewrite: { '^/': '/api/pengaduan/' },
    on: {
        error: (err, req, res) => {
            res.status(503).json({ message: 'Pengaduan service tidak tersedia' });
        }
    }
}));

// routing ke notifikasi-service (port 3003)
app.use('/notifikasi', createProxyMiddleware({
    target: process.env.NOTIFIKASI_SERVICE,
    changeOrigin: true,
   pathRewrite: { '^/': '/notifikasi/' },
    on: {
        error: (err, req, res) => {
            res.status(503).json({ message: 'Notifikasi service tidak tersedia' });
        }
    }
}));

// Disposisi route root ke health check
app.use('/disposisi', createProxyMiddleware({
    target: process.env.PENGADUAN_SERVICE,
    changeOrigin: true,
     pathRewrite: { '^/': '/api/disposisi/' },
    on: {
        error: (err, req, res) => {
            res.status(502).json({ message: 'Pengaduan service tidak bisa diakses' });
        }
    }
}));

// route tidak ditemukan
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.method} ${req.path} tidak ditemukan` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API Gateway jalan di port ${PORT}`);
    console.log(`Auth     → ${process.env.AUTH_SERVICE}`);
    console.log(`Pengaduan → ${process.env.PENGADUAN_SERVICE}`);
    console.log(`Notifikasi → ${process.env.NOTIFIKASI_SERVICE}`);
});