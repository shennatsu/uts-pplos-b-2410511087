const express = require('express');
const router = express.Router();
const { authMiddleware, internalMiddleware } = require('../middleware/jwtMiddleware');
const { kirimNotifikasi, getNotifikasi, bacaNotifikasi } = require('../controllers/NotifikasiController');

// POST /notifikasi — khusus internal dari pengaduan-service
router.post('/notifikasi', internalMiddleware, kirimNotifikasi);

// GET /notifikasi/:userId — butuh JWT
router.get('/notifikasi/:userId', authMiddleware, getNotifikasi);

// PUT /notifikasi/:id/read — butuh JWT
router.put('/notifikasi/:id/read', authMiddleware, bacaNotifikasi);

module.exports = router;