var mongoose = require('mongoose');

module.exports = function conectarBaseDeDatos() {
    var uri;

    if (process.env.NODE_ENV === 'production') {
        // Producción: Mongo Atlas, la URI viene de la variable de entorno MONGO_URI
        uri = process.env.MONGO_URI;
    } else {
        // Desarrollo: Mongo local
        uri = 'mongodb://localhost:27017/red_bicicletas';
    }

    mongoose.set('strictQuery', false);
    mongoose.connect(uri)
        .then(() => console.log('Conectado a MongoDB (' + (process.env.NODE_ENV || 'development') + ')'))
        .catch(err => console.log('Error de conexión a MongoDB:', err));
};
