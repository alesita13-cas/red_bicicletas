var mongoose = require('mongoose');
var crypto = require('crypto');
var Schema = mongoose.Schema;

var tokenSchema = new Schema({
    _userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Usuario'
    },
    token: {
        type: String,
        required: true,
        default: function () {
            return crypto.randomBytes(20).toString('hex');
        }
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: 43200 // Mongo borra el documento solo a las 12 horas (TTL index)
    }
});

module.exports = mongoose.model('Token', tokenSchema);
