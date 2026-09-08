var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('jsonwebtoken');
var passportConfig = require('../config/passport');

// --- Google: login con sesión (redirige a Google y vuelve) ---
router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
        res.redirect('/bicicletas');
    }
);

// --- Facebook: recibe el access_token del cliente, lo valida contra
// la Graph API de Facebook (lo hace passport-facebook-token) y devuelve un JWT ---
router.post('/auth/facebook/token',
    passport.authenticate('facebook-token', { session: false }),
    function (req, res) {
        var token = jwt.sign(
            { sub: req.user._id, email: req.user.email },
            passportConfig.JWT_SECRET,
            { expiresIn: '2h' }
        );
        res.status(200).json({ token: token });
    }
);

module.exports = router;
