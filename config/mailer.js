var nodemailer = require('nodemailer');

var transporter;

if (process.env.NODE_ENV === 'production') {
    // Producción: SendGrid (usuario literal "apikey", la contraseña es tu API Key de SendGrid)
    transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY
        }
    });
} else {
    // Desarrollo local: Ethereal (buzón de prueba, no manda mails reales)
    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
        port: process.env.EMAIL_PORT || 587,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
}

exports.enviarEmailBienvenida = function (usuario, token, cb) {
    var baseUrl = process.env.APP_URL || 'http://localhost:3000';
    var link = baseUrl + '/verify/' + token;

    var mailOptions = {
        from: '"Red de Bicicletas" <no-reply@redbicicletas.com>',
        to: usuario.email,
        subject: 'Verificá tu cuenta - Red de Bicicletas',
        html: '<h3>¡Bienvenido/a a Red de Bicicletas!</h3>' +
              '<p>Gracias por registrarte. Hacé click en el siguiente link para verificar tu cuenta:</p>' +
              '<a href="' + link + '">' + link + '</a>' +
              '<p>Si no creaste esta cuenta, ignorá este correo.</p>'
    };

    transporter.sendMail(mailOptions, cb);
};

exports.enviarEmailResetPassword = function (usuario, token, cb) {
    var baseUrl = process.env.APP_URL || 'http://localhost:3000';
    var link = baseUrl + '/reset-password/' + token;

    var mailOptions = {
        from: '"Red de Bicicletas" <no-reply@redbicicletas.com>',
        to: usuario.email,
        subject: 'Recuperación de contraseña - Red de Bicicletas',
        html: '<p>Solicitaste recuperar tu contraseña.</p>' +
              '<p>Hacé click en el siguiente link (válido por 1 hora):</p>' +
              '<a href="' + link + '">' + link + '</a>' +
              '<p>Si no fuiste vos, ignorá este correo.</p>'
    };

    transporter.sendMail(mailOptions, cb);
};
