var Usuario = require('../models/usuario');
var Token = require('../models/token');
var crypto = require('crypto');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var mailer = require('../config/mailer');
var passportConfig = require('../config/passport');

// --- Registro ---
exports.formRegister = function (req, res) {
    res.render('usuarios/register', { errores: req.flash('error') });
};

exports.register = function (req, res) {
    var usuario = new Usuario({
        email: req.body.email,
        password: req.body.password
    });

    usuario.save(function (err) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('/register');
        }

        var token = new Token({ _userId: usuario._id });

        token.save(function (err) {
            if (err) {
                req.flash('error', 'Error generando el token de verificación');
                return res.redirect('/register');
            }

            mailer.enviarEmailBienvenida(usuario, token.token, function (err, info) {
                if (err) console.log('Error enviando el email de bienvenida:', err);
                else console.log('Email de bienvenida enviado:', info && info.messageId);
            });

            req.flash('success', 'Te registraste correctamente. Revisá tu email para verificar la cuenta.');
            res.redirect('/login');
        });
    });
};

// --- Verificación de cuenta ---
exports.verify = function (req, res) {
    Token.findOne({ token: req.params.token }, function (err, token) {
        if (!token) {
            req.flash('error', 'El link de verificación es inválido o ya expiró');
            return res.redirect('/login');
        }

        Usuario.findById(token._userId, function (err, usuario) {
            if (!usuario) {
                req.flash('error', 'No existe el usuario asociado a este token');
                return res.redirect('/login');
            }
            if (usuario.verificado) {
                req.flash('error', 'Esta cuenta ya fue verificada anteriormente');
                return res.redirect('/login');
            }

            usuario.verificado = true;
            usuario.save(function (err) {
                if (err) {
                    req.flash('error', 'Error verificando la cuenta');
                    return res.redirect('/login');
                }
                req.flash('success', '¡Cuenta verificada correctamente! Ya podés iniciar sesión.');
                res.redirect('/login');
            });
        });
    });
};

// --- Login (sesión, para las vistas) ---
exports.formLogin = function (req, res) {
    res.render('usuarios/login', {
        errores: req.flash('error'),
        mensajes: req.flash('success')
    });
};

exports.login = passport.authenticate('local', {
    successRedirect: '/bicicletas',
    failureRedirect: '/login',
    failureFlash: true
});

exports.logout = function (req, res, next) {
    req.logout(function (err) {
        if (err) return next(err);
        res.redirect('/login');
    });
};

// --- Recuperación de contraseña ---
exports.formForgotPassword = function (req, res) {
    res.render('usuarios/forgot-password', {
        mensajes: req.flash('success'),
        errores: req.flash('error')
    });
};

exports.forgotPassword = function (req, res) {
    Usuario.findOne({ email: req.body.email }, function (err, usuario) {
        if (!usuario) {
            req.flash('error', 'No existe una cuenta con ese email');
            return res.redirect('/forgot-password');
        }

        usuario.passwordResetToken = crypto.randomBytes(20).toString('hex');
        usuario.passwordResetTokenExpires = Date.now() + 3600000; // 1 hora

        usuario.save(function (err) {
            if (err) {
                req.flash('error', 'Error generando el link de recuperación');
                return res.redirect('/forgot-password');
            }

            mailer.enviarEmailResetPassword(usuario, usuario.passwordResetToken, function (err, info) {
                if (err) console.log('Error enviando el email de recuperación:', err);
                else console.log('Email de recuperación enviado:', info && info.messageId);
            });

            req.flash('success', 'Te enviamos un email con el link para recuperar tu contraseña');
            res.redirect('/forgot-password');
        });
    });
};

exports.formResetPassword = function (req, res) {
    Usuario.findOne({
        passwordResetToken: req.params.token,
        passwordResetTokenExpires: { $gt: Date.now() }
    }, function (err, usuario) {
        if (!usuario) {
            req.flash('error', 'El link de recuperación es inválido o ya expiró');
            return res.redirect('/forgot-password');
        }
        res.render('usuarios/reset-password', {
            token: req.params.token,
            errores: req.flash('error')
        });
    });
};

exports.resetPassword = function (req, res) {
    Usuario.findOne({
        passwordResetToken: req.params.token,
        passwordResetTokenExpires: { $gt: Date.now() }
    }, function (err, usuario) {
        if (!usuario) {
            req.flash('error', 'El link de recuperación es inválido o ya expiró');
            return res.redirect('/forgot-password');
        }

        usuario.password = req.body.password;
        usuario.passwordResetToken = null;
        usuario.passwordResetTokenExpires = null;

        usuario.save(function (err) {
            if (err) {
                req.flash('error', 'Error actualizando la contraseña');
                return res.redirect('back');
            }
            req.flash('success', 'Contraseña actualizada. Ya podés iniciar sesión.');
            res.redirect('/login');
        });
    });
};

// --- Login para la API: devuelve un JWT ---
exports.apiLogin = function (req, res, next) {
    passport.authenticate('local', { session: false }, function (err, usuario, info) {
        if (err) return res.status(500).json({ error: 'Error del servidor' });
        if (!usuario) return res.status(401).json({ error: info ? info.message : 'Credenciales inválidas' });

        var token = jwt.sign(
            { sub: usuario._id, email: usuario.email },
            passportConfig.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.status(200).json({ token: token });
    })(req, res, next);
};
