// Bibliotecas
const request = require('supertest');
const sinon = require('sinon');
const { expect } = require('chai');
const transferService = require('../../service/transferService');

// Mock do middleware de autenticação
const express = require('express');
const transferController = require('../../controller/transferController');

function getMockedApp() {
    const app = express();
    app.use(express.json());
    // Middleware de autenticação mockado
    app.use((req, res, next) => next());
    app.use('/transfers', transferController);
    return app;
}


// Testes
describe('Transfer', () => {
    describe('POST /transfers', () => {
        let token;
        let stubTransfer;
        let app;

        beforeEach(() => {
            token = 'mocked-token';
            stubTransfer = sinon.stub(transferService, 'transfer');
            app = getMockedApp();
        });

        afterEach(() => {
            sinon.restore();
        });

        it('Quando informo remetente e destinatario inexistentes recebo 400', async () => {
            stubTransfer.throws(new Error('Usuário remetente ou destinatário não encontrado'));
            const resposta = await request(app)
                .post('/transfers')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    from: "julio",
                    to: "isabelle",
                    value: 100
                });
            expect(resposta.status).to.equal(400);
            expect(resposta.body).to.have.property('error', 'Usuário remetente ou destinatário não encontrado');
        });

        it('Usando Mocks: Quando informo remetente e destinatario inexistentes recebo 400', async () => {
            stubTransfer.throws(new Error('Usuário remetente ou destinatário não encontrado'));
            const resposta = await request(app)
                .post('/transfers')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    from: "jose",
                    to: "isabelle",
                    value: 100
                });
            expect(resposta.status).to.equal(400);
            expect(resposta.body).to.have.property('error', 'Usuário remetente ou destinatário não encontrado');
        });

        it('Usando Mocks: Quando informo valores válidos eu tenho sucesso com 201 CREATED', async () => {
            const resposta = await request(app)
                .post('/transfers')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    from: "julio",
                    to: "priscila",
                    value: 100
                });

            expect(resposta.status).to.equal(201);
            // Validação com um Fixture
            const respostaEsperada = require('../fixture/respostas/quandoInformoValoresValidosEuTenhoSucessoCom201Created.json')
            delete resposta.body.date;
            delete respostaEsperada.date; 
            expect(resposta.body).to.deep.equal(respostaEsperada);
        });
    });
});