const express = require('express');
const router = express.Router();
const passport = require('passport');

const { register, login, refreshToken, logout, getMe } = require('../controllers/AuthController');
const { githubCallback } = require('../controllers/OAuthController');
const authMiddleware = require('../middleware/jwtMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getMe);

// GitHub OAuth - NIM ganjil wajib pake GitHub
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: '/auth/github/failed' }),
    githubCallback
);
router.get('/github/failed', (req, res) => {
    res.status(401).json({ message: 'Login GitHub gagal' });
});

module.exports = router;