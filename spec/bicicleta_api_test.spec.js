var request = require('request');

var base_url = 'http://localhost:3000/api/bicicletas';

describe('Bicicleta API', () => {
    describe('GET /api/bicicletas', () => {
        it('Status 200', (done) => {
            request.get(base_url, function (error, response, body) {
                expect(response.statusCode).toBe(200);
                done();
            });
        });
    });

    describe('POST /api/bicicletas/create', () => {
        it('Status 200 - crea una bicicleta', (done) => {
            var headers = { 'content-type': 'application/json' };
            var aBici = '{"id": 10, "color": "rojo", "modelo": "urbana", "lat": -34, "lng": -54}';

            request.post({
                headers: headers,
                url: base_url + '/create',
                body: aBici
            }, function (error, response, body) {
                expect(response.statusCode).toBe(200);
                var bici = JSON.parse(body).bicicleta;
                expect(bici.color).toBe('rojo');
                expect(bici.modelo).toBe('urbana');
                done();
            });
        });
    });

    describe('PUT /api/bicicletas/update', () => {
        it('Status 200 - actualiza una bicicleta', (done) => {
            var headers = { 'content-type': 'application/json' };
            var aBici = '{"id": 10, "color": "azul", "modelo": "montaña", "lat": -33, "lng": -55}';

            request.put({
                headers: headers,
                url: base_url + '/update',
                body: aBici
            }, function (error, response, body) {
                expect(response.statusCode).toBe(200);
                done();
            });
        });
    });

    describe('DELETE /api/bicicletas/delete', () => {
        it('Status 204 - elimina una bicicleta', (done) => {
            var headers = { 'content-type': 'application/json' };
            var aBici = '{"id": 10}';

            request.delete({
                headers: headers,
                url: base_url + '/delete',
                body: aBici
            }, function (error, response, body) {
                expect(response.statusCode).toBe(204);
                done();
            });
        });
    });
});
