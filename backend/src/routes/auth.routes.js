const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const { login, verifyTokenController, googleCallback } = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');

// Rutas de login tradicional
router.post('/login', login);
router.get('/verify', authMiddleware, verifyTokenController);

// Rutas de Google OAuth
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
    })
);

router.get(
    '/google/callback',
    (req, res, next) => {
        passport.authenticate('google', {
            session: false,
            failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`,
        })(req, res, next);
    },
    googleCallback
);

module.exports = router;