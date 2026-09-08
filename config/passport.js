var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var FacebookTokenStrategy = require('passport-facebook-token');
var Usuario = require('../models/usuario');

var JWT_SECRET = process.env.JWT_SECRET || 'unaClaveSecretaParaElCursoNodeJS';

// --- Estrategia local: usada en el login web (con sesión) ---
passport.use('local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, function (email, password, done) {
    Usuario.findOne({ email: email.toLowerCase() }, function (err, usuario) {
        if (err) return done(err);
        if (!usuario) return done(null, false, { message: 'No existe un usuario con ese email' });

        usuario.compararPassword(password, function (err, isMatch) {
            if (err) return done(err);
            if (!isMatch) return done(null, false, { message: 'Contraseña incorrecta' });
            if (!usuario.verificado) return done(null, false, { message: 'Debés verificar tu cuenta desde el email que te enviamos' });
            return done(null, usuario);
        });
    });
}));

// --- Estrategia JWT: usada para proteger la API Rest ---
passport.use('jwt', new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET
}, function (jwtPayload, done) {
    Usuario.findById(jwtPayload.sub, function (err, usuario) {
        if (err) return done(err, false);
        if (!usuario) return done(null, false);
        return done(null, usuario);
    });
}));

// --- Estrategia Google OAuth2 (login social, con sesión) ---
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use('google', new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
    }, function (accessToken, refreshToken, profile, done) {
        Usuario.findOneOrCreateByGoogle(profile, function (err, usuario) {
            return done(err, usuario);
        });
    }));
}

// --- Estrategia Facebook Token ---
// passport-facebook-token valida el access_token que manda el cliente
// directamente contra la Graph API de Facebook antes de crear/loguear al usuario.
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use('facebook-token', new FacebookTokenStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET
    }, function (accessToken, refreshToken, profile, done) {
        // Si passport-facebook-token llegó hasta acá, ya validó el token con Facebook.
        Usuario.findOneOrCreateByFacebook(profile, function (err, usuario) {
            return done(err, usuario);
        });
    }));
}

// --- Serialización para la sesión (login web) ---
passport.serializeUser(function (usuario, done) {
    done(null, usuario.id);
});

passport.deserializeUser(function (id, done) {
    Usuario.findById(id, function (err, usuario) {
        done(err, usuario);
    });
});

module.exports = { JWT_SECRET: JWT_SECRET };
