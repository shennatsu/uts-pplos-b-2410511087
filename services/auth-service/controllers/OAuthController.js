const jwt = require('jsonwebtoken');
const { getUserByOAuth, getUserById, createUser } = require('../models/UserModel');
const { simpanRefreshToken } = require('../models/RefreshTokenModel');

// handler setelah redirect dari GitHub
const githubCallback = async (req, res) => {
    try {
        const githubProfile = req.user; // dari passport

        // cek apakah user udah pernah login pake github ini
        let user = await getUserByOAuth('github', String(githubProfile.id));

        if (!user) {
            // belum ada, buat user baru
            const email = githubProfile.emails?.[0]?.value || `gh_${githubProfile.id}@noemail.com`;
            const foto = githubProfile.photos?.[0]?.value || null;

            const newId = await createUser({
                nama: githubProfile.displayName || githubProfile.username,
                email: email,
                foto_profil: foto,
                oauth_provider: 'github',
                oauth_id: String(githubProfile.id)
            });
            user = await getUserById(newId);
        }

        // buat token untuk user ini
        const payload = { id: user.id, email: user.email, role: user.role };
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET, { expiresIn: process.env.REFRESH_EXPIRES_IN });

        const expiredAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await simpanRefreshToken(user.id, refreshToken, expiredAt);

        res.json({
            message: 'Login GitHub berhasil',
            accessToken,
            refreshToken,
            user: { id: user.id, nama: user.nama, email: user.email, role: user.role }
        });
    } catch (err) {
        console.error('OAuth error:', err.message);
        res.status(500).json({ message: 'OAuth gagal' });
    }
};

module.exports = { githubCallback };