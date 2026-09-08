var Bicicleta = require('../models/bicicleta');

exports.bicicleta_list = function (req, res) {
    Bicicleta.allBicis(function (err, bicis) {
        if (err) return res.status(500).send(err);
        res.status(200).json({ bicicletas: bicis });
    });
};

exports.bicicleta_create = function (req, res) {
    var ubicacion = [req.body.lat, req.body.lng];
    var bici = Bicicleta.createInstance(req.body.id, req.body.color, req.body.modelo, ubicacion);

    Bicicleta.add(bici, function (err, newBici) {
        if (err) return res.status(400).json({ errors: err });
        res.status(200).json({ bicicleta: newBici });
    });
};

exports.bicicleta_update = function (req, res) {
    Bicicleta.findByCode(req.body.id, function (err, bici) {
        if (err) return res.status(500).send(err);
        if (!bici) return res.status(404).send();

        bici.color = req.body.color;
        bici.modelo = req.body.modelo;
        bici.ubicacion = [req.body.lat, req.body.lng];

        bici.save(function (err) {
            if (err) return res.status(400).json({ errors: err });
            res.status(200).json({ bicicleta: bici });
        });
    });
};

exports.bicicleta_delete = function (req, res) {
    Bicicleta.removeByCode(req.body.id, function (err) {
        if (err) return res.status(500).send(err);
        res.status(204).send();
    });
};
