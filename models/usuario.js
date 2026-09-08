var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var crypto = require('crypto');
var Schema = mongoose.Schema;

var usuarioSchema = new Schema({
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'El email no tiene un formato válido']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
    },
    passwordResetToken: {
        type: String,
        default: null
    },
    passwordResetTokenExpires: {
        type: Date,
        default: null
    },
    verificado: {
        type: Boolean,
        default: false
    },
    googleId: {
        type: String,
        default: null,
        index: { unique: true, sparse: true }
    },
    facebookId: {
        type: String,
        default: null,
        index: { unique: true, sparse: true }
    }
});

// Hashea la contraseña antes de guardar, solo si cambió
usuarioSchema.pre('save', function (next) {
    var usuario = this;
    if (!usuario.isModified('password')) return next();

    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);
        bcrypt.hash(usuario.password, salt, function (err, hash) {
            if (err) return next(err);
            usuario.password = hash;
            next();
        });
    });
});

usuarioSchema.methods.compararPassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

// --- Login social con Google ---
// Busca un usuario por googleId; si no existe, lo busca por email (para
// vincular una cuenta ya registrada); si tampoco existe, lo crea nuevo.
usuarioSchema.statics.findOneOrCreateByGoogle = function (profile, cb) {
    var Usuario = this;
    var email = profile.emails && profile.emails[0] && profile.emails[0].value;

    Usuario.findOne({ googleId: profile.id }, function (err, usuario) {
        if (err) return cb(err);
        if (usuario) return cb(null, usuario);

        Usuario.findOne({ email: email }, function (err, existente) {
            if (err) return cb(err);

            if (existente) {
                existente.googleId = profile.id;
                existente.verificado = true;
                return existente.save(cb);
            }

            var nuevoUsuario = new Usuario({
                googleId: profile.id,
                email: email,
                // password aleatoria: esta cuenta solo se usa vía Google, no con login local
                password: crypto.randomBytes(16).toString('hex'),
                verificado: true
            });
            nuevoUsuario.save(cb);
        });
    });
};

// --- Login social con Facebook ---
// Misma lógica que con Google, usando el facebookId del perfil validado.
usuarioSchema.statics.findOneOrCreateByFacebook = function (profile, cb) {
    var Usuario = this;
    var email = profile.emails && profile.emails[0] && profile.emails[0].value;

    Usuario.findOne({ facebookId: profile.id }, function (err, usuario) {
        if (err) return cb(err);
        if (usuario) return cb(null, usuario);

        Usuario.findOne({ email: email }, function (err, existente) {
            if (err) return cb(err);

            if (existente) {
                existente.facebookId = profile.id;
                existente.verificado = true;
                return existente.save(cb);
            }

            var nuevoUsuario = new Usuario({
                facebookId: profile.id,
                email: email || (profile.id + '@facebook.local'),
                password: crypto.randomBytes(16).toString('hex'),
                verificado: true
            });
            nuevoUsuario.save(cb);
        });
    });
};

module.exports = mongoose.model('Usuario', usuarioSchema);
