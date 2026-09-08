var mongoose = require('mongoose');
var Bicicleta = require('../../models/bicicleta');

describe('Testing Bicicletas', () => {
    beforeAll(function (done) {
        mongoose.connect('mongodb://localhost:27017/red_bicicletas_test')
            .then(() => {
                console.log('Conectado a la base de datos de test');
                done();
            });
    });

    afterEach(function (done) {
        Bicicleta.deleteMany({}, function (err) {
            done();
        });
    });

    afterAll(function (done) {
        mongoose.connection.close();
        done();
    });

    describe('Bicicleta.createInstance', () => {
        it('crea una instancia de bicicleta', () => {
            var bici = Bicicleta.createInstance(1, 'rojo', 'urbana', [-34, -54]);
            expect(bici.code).toBe(1);
            expect(bici.color).toBe('rojo');
            expect(bici.modelo).toBe('urbana');
        });
    });

    describe('Bicicleta.allBicis', () => {
        it('comienza sin bicicletas', (done) => {
            Bicicleta.allBicis((err, bicis) => {
                expect(bicis.length).toBe(0);
                done();
            });
        });
    });

    describe('Bicicleta.add', () => {
        it('agrega una bicicleta y persiste en la base', (done) => {
            var aBici = Bicicleta.createInstance(1, 'verde', 'urbana', [-34, -54]);
            Bicicleta.add(aBici, (err, newBici) => {
                if (err) console.log(err);
                Bicicleta.allBicis((err, bicis) => {
                    expect(bicis.length).toEqual(1);
                    expect(bicis[0].code).toEqual(aBici.code);
                    done();
                });
            });
        });
    });

    describe('Bicicleta.findByCode', () => {
        it('debe devolver la bicicleta con code 1', (done) => {
            var aBici = Bicicleta.createInstance(1, 'verde', 'urbana', [-34, -54]);
            Bicicleta.add(aBici, (err, newBici) => {
                var aBici2 = Bicicleta.createInstance(2, 'rojo', 'urbana', [-34, -54]);
                Bicicleta.add(aBici2, (err, newBici2) => {
                    Bicicleta.findByCode(1, (err, targetBici) => {
                        expect(targetBici.code).toEqual(aBici.code);
                        done();
                    });
                });
            });
        });
    });

    describe('Bicicleta.removeByCode', () => {
        it('elimina la bicicleta con el code dado', (done) => {
            var aBici = Bicicleta.createInstance(1, 'verde', 'urbana', [-34, -54]);
            Bicicleta.add(aBici, (err, newBici) => {
                Bicicleta.removeByCode(1, (err) => {
                    Bicicleta.allBicis((err, bicis) => {
                        expect(bicis.length).toEqual(0);
                        done();
                    });
                });
            });
        });
    });
});
