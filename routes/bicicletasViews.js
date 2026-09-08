var express = require('express');
var router = express.Router();
var Bicicleta = require('../models/bicicleta');
var auth = require('../middlewares/auth');

router.get('/', auth.ensureAuthenticated, function (req, res) {
    Bicicleta.allBicis(function (err, bicis) {
        res.render('bicicletas/index', { bicicletas: bicis, usuario: req.user });
    });
});

module.exports = router;
