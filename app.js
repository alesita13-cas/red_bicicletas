// New Relic debe ser el primer require del archivo, antes que cualquier otro módulo
require('newrelic');

require('dotenv').config();

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var flash = require('connect-flash');
var passport = require('passport');

var conectarBaseDeDatos = require('./config/database');
require('./config/passport');

var biciApiRouter = require('./routes/bicicleta');
var biciViewsRouter = require('./routes/bicicletasViews');
var usuariosRouter = require('./routes/usuarios');
var apiAuthRouter = require('./routes/api/auth');
var authSocialRouter = require('./routes/auth-social');

var app = express();

// Conexión a MongoDB: local en desarrollo, Atlas (MONGO_URI) en producción
conectarBaseDeDatos();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Sesión + Passport (para las vistas: login, register, etc.)
app.use(session({
    secret: process.env.SESSION_SECRET || 'secretoDeLaSesionRedBicicletas',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function (req, res) {
    res.redirect('/bicicletas');
});

// Vistas de usuario: login, registro, verify, forgot/reset password
app.use('/', usuariosRouter);

// Login social: Google (sesión) y Facebook (token -> JWT)
app.use('/', authSocialRouter);

// Vistas de bicicletas, protegidas por sesión (si no estás logueado, redirige a /login)
app.use('/bicicletas', biciViewsRouter);

// API pública: login que devuelve un JWT
app.use('/api/auth', apiAuthRouter);

// API Rest de bicicletas, protegida con JWT (sin token válido -> 401)
app.use('/api/bicicletas', passport.authenticate('jwt', { session: false }), biciApiRouter);

module.exports = app;
