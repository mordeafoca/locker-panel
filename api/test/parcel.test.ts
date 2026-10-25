import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { ParcelModel } from '../src/infra/parcel-model.js';
import { buildApp } from './helpers/build-app.js';
import { useTestDatabase } from './helpers/test-database.js';

useTestDatabase();

describe('POST /parcels', () => {
    it('cria uma encomenda e grava-a na BD', async () => {
        const res = await request(buildApp())
            .post('/parcels')
            .send({ id: 'P1', size: 'M', carrier: 'rapidex' });

        expect(res.status).toBe(201);
        expect(res.body).toEqual({
            id: 'P1', size: 'M', carrier: 'rapidex', status: 'created', compartmentId: null,
        });
        expect(await ParcelModel.findById('P1')).not.toBeNull();    
    });

    it('rejeita um id repetido com 409', async () => {
        const app = buildApp();
        await request(app).post('/parcels').send({ id: 'P1', size: 'M', carrier: 'rapidex'});

        const res = await request(app).post('/parcels').send({ id: 'P1', size: 'S', carrier: 'andorinha' });

        expect(res.status).toBe(409);
        expect(res.body).toEqual({ error: 'PARCEL_ALREADY_EXISTS'});
    });

    it.each([
        ['tamanho inválido', { id: 'P1', size: 'XL', carrier: 'rapidex' }],
        ['transportadora desconhecida', { id: 'P1', size: 'M', carrier: 'dhl' }],
        ['id vazio', { id: '   ', size: 'M', carrier: 'rapidex' }],
        ['campos em falta', {}], 
    ])('rejeita %s com 400', async (_nullable, body) => {
        const res = await request(buildApp()).post('/parcels').send(body);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('rejeita JSON malformatado com 400', async () => {
        const res = await request(buildApp())
            .post('/parcels')
            .set('Content-Type', 'application/json')
            .send("{ ceci n'est pa du json");

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ error: 'INVALID_JSON'});    
    });
});