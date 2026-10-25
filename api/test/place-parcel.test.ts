import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { CompartmentModel } from '../src/infra/compartment-model.js';
import { MongoCompartmentRepository } from '../src/infra/mongo-compartment-repository.js';
import { ParcelModel } from '../src/infra/parcel-model.js';
import { buildApp } from './helpers/build-app.js';
import { useTestDatabase } from './helpers/test-database.js';

useTestDatabase();

async function givenCompartment(id: string, size: 'S' | 'M' | 'L') {
    await CompartmentModel.create({ _id: id, size, status: 'free', parcelId: null});
}

async function givenParcel(id: string, size: 'S' | 'M' | 'L') {
    await ParcelModel.create({ _id: id, size, carrier: 'rapidex', status: 'created', compartmentId: null});
}

describe('POST /parcels/:id/place', () => {
    it('coloca no compartimento sugerido quando não se indica nenhum', async () => {
        await givenCompartment('C01', 'L');
        await givenCompartment('C02', 'S');
        await givenParcel('P1', 'S');

        const res = await request(buildApp()).post('/parcels/P1/place');

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ id: 'P1', status: 'placed', compartmentId: 'C02'});
        expect(await CompartmentModel.findById('C02').lean()).toMatchObject({
            status: 'occupied', parcelId: 'P1',
        });
    });

    
    it('coloca no compartimento escolhido', async () => {
        await givenCompartment('C01', 'L');
        await givenParcel('P1', 'S');

        const res = await request(buildApp()).post('/parcels/P1/place').send({ compartmentId: 'C01'});

        expect(res.status).toBe(200);
        expect(res.body.compartmentId).toBe('C01');
    });

    it('idempotencia: repetir o pedido devolve 200 sem mudar nada', async () => {
        await givenCompartment('C01', 'M');
        await givenParcel('P1', 'M');
        const app = buildApp();
        await request(app).post('/parcels/P1/place').send({ compartmentId: 'C01'});

        const res = await request(app).post('/parcels/P1/place').send({ compartmentId: 'C01'});

        expect(res.status).toBe(200);
        expect(res.body.compartmentId).toBe('C01');
    });

    it('devolve 404 para uma encomenda que não existe', async () => {
        const res = await request(buildApp()).post('/parcels/NAO-EXISTE/place');

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: 'PARCEL_NOT_FOUND'});
    })

    it('devolve 404 para um compartimento que nao existe', async () => {
        await givenParcel('P1', 'S');

        const res = await request(buildApp()).post('/parcels/P1/place').send({ compartmentId: 'C67'});

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: 'COMPARTMENT_NOT_FOUND'});
    });

    it('devolve 422 quando a encomenda não cabe', async () => {
        await givenCompartment('C01', 'S');
        await givenParcel('P1', 'L');

        const res = await request(buildApp()).post('/parcels/P1/place').send({ compartmentId: 'C01'});

        expect(res.status).toBe(422);
        expect(res.body).toEqual({ error: 'PARCEL_TOO_LARGE'});
    });

    it('devolve 409 quando não há nenhum compartimento livre onde caiba', async () => {
        await givenCompartment('C01', 'S');
        await givenParcel('P1', 'L');

        const res = await request(buildApp()).post('/parcels/P1/place');

        expect(res.status).toBe(409);
        expect(res.body).toEqual({ error: 'NO_COMPARTMENT_AVAILABLE'});
    })

    it('com dois pedidos ao mesmo tempo para o mesmo compartimento, só um ganha', async () => {
        await givenCompartment('C01', 'S');
        await givenParcel('P1', 'S');
        await givenParcel('P2', 'S');
        const app = buildApp();

        const results = await Promise.all([
            request(app).post('/parcels/P1/place').send({ compartmentId: 'C01'}),
            request(app).post('/parcels/P2/place').send({ compartmentId: 'C01'}),
        ]);

        expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
        const compartment= await CompartmentModel.findById('C01').lean();
        const winner = results.find((r) => r.status === 200)?.body.id;
        expect(compartment?.parcelId).toBe(winner);
    });

});

describe('MongoCompartmentRepository.occupy', () => {
    it('só ocupa um compartimento que está livre', async () => {
        const repo = new MongoCompartmentRepository();
        await givenCompartment('C01', 'S');

        expect(await repo.occupy('C01', 'P1')).toBe(true);
        expect(await repo.occupy('C01', 'P2')).toBe(false);
        expect((await CompartmentModel.findById('C01').lean())?.parcelId).toBe('P1');
        
    });
});
