var express = require('express');
var router = express.Router();
var usuarioController = require('../../controllers/usuario');

// POST /api/auth/login  { email, password }  -> { token }
router.post('/login', usuarioController.apiLogin);

module.exports = router;
