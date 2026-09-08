exports.ensureAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) return next();
    req.flash('error', 'Debés iniciar sesión para acceder a esa página');
    res.redirect('/login');
};

exports.ensureNotAuthenticated = function (req, res, next) {
    if (!req.isAuthenticated()) return next();
    res.redirect('/bicicletas');
};
