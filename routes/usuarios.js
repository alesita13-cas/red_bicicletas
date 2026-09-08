var express = require('express');
var router = express.Router();
var usuarioController = require('../controllers/usuario');
var auth = require('../middlewares/auth');

router.get('/register', auth.ensureNotAuthenticated, usuarioController.formRegister);
router.post('/register', auth.ensureNotAuthenticated, usuarioController.register);

router.get('/login', auth.ensureNotAuthenticated, usuarioController.formLogin);
router.post('/login', auth.ensureNotAuthenticated, usuarioController.login);

router.get('/logout', usuarioController.logout);

router.get('/verify/:token', usuarioController.verify);

router.get('/forgot-password', usuarioController.formForgotPassword);
router.post('/forgot-password', usuarioController.forgotPassword);

router.get('/reset-password/:token', usuarioController.formResetPassword);
router.post('/reset-password/:token', usuarioController.resetPassword);

module.exports = router;
