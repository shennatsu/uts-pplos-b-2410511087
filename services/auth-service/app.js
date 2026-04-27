require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;

const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// setup GitHub OAuth strategy
passport.use(new GitHubStrategy(
    {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL
    },
    (accessToken, refreshToken, profile, done) => {
        return done(null, profile);
    }
));

// semua route auth ada di sini
app.use('/auth', authRoutes);

// health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'auth-service', port: process.env.PORT });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Auth service jalan di port ${PORT}`);
});