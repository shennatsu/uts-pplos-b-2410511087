const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getUserByEmail, getUserById, createUser } = require('../models/UserModel');
const { simpanRefreshToken, cariRefreshToken, hapusRefreshToken } = require('../models/RefreshTokenModel');
const { blacklistToken } = require('../models/BlacklistModel');

// helper buat bikin token
function buatToken(user) {
    const payload = { id: user.id, email: user.email, role: user.role };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN // max 15 menit
    });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET, {
        expiresIn: process.env.REFRESH_EXPIRES_IN // max 7 hari
    });

    return { accessToken, refreshToken };
}

// POST /auth/register
const register = async (req, res) => {
    try {
        const { nama, email, password, role } = req.body;

        // validasi input dulu
        if (!nama || !email || !password) {
            return res.status(400).json({ message: 'nama, email, dan password wajib diisi' });
        }

        // cek email sudah terdaftar belum
        const existing = await getUserByEmail(email);
        if (existing) {
            return res.status(409).json({ message: 'Email sudah terdaftar' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = await createUser({ nama, email, password: hashedPassword, role });

        res.status(201).json({ message: 'Registrasi berhasil', userId });
    } catch (err) {
        console.error('Error register:', err.message);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};

// POST /auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        const { accessToken, refreshToken } = buatToken(user);

        // simpan refresh token ke DB, expired 7 hari
        const expiredAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await simpanRefreshToken(user.id, refreshToken, expiredAt);

        res.json({
            message: 'Login berhasil',
            accessToken,
            refreshToken,
            user: { id: user.id, nama: user.nama, email: user.email, role: user.role }
        });
    } catch (err) {
        console.error('Error login:', err);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};

// POST /auth/refresh
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token diperlukan' });
        }

        // cari di DB
        const tokenData = await cariRefreshToken(refreshToken);
        if (!tokenData) {
            return res.status(401).json({ message: 'Refresh token tidak valid atau sudah expired' });
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
        const user = await getUserById(decoded.id);

        const tokens = buatToken(user);

        // hapus yang lama, simpan yang baru
        await hapusRefreshToken(refreshToken);
        const expiredAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await simpanRefreshToken(user.id, tokens.refreshToken, expiredAt);

        res.json({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
    } catch (err) {
        res.status(401).json({ message: 'Token tidak valid' });
    }
};

// POST /auth/logout
const logout = async (req, res) => {
    try {
        const token = req.headers['authorization'].split(' ')[1];
        await blacklistToken(token);
        res.json({ message: 'Logout berhasil' });
    } catch (err) {
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};

// GET /auth/me — info user yang sedang login
const getMe = async (req, res) => {
    try {
        const user = await getUserById(req.user.id);
        res.json({ id: user.id, nama: user.nama, email: user.email, role: user.role });
    } catch (err) {
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};

module.exports = { register, login, refreshToken, logout, getMe };