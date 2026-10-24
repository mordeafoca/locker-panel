import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { createApp } from '../src/app.js';
import { CompartmentModel } from '../src/infra/compartment-model.js';
import { MongoCompartmentRepository } from '../src/infra/mongo-compartment-repository.js';
import { useTestDatabase } from './helpers/test-database.js';

useTestDatabase();

describe('GET /locker', () => {
    it('devolve os compartimentos odenados, com id em vez de _id', async () => {
        await CompartmentModel.insertMany([
            { _id: 'C02', size: 'M', status: 'occupied', parcelId: 'P1'},
            { _id: 'C01', size: 'S', status: 'free', parcelId: null },
        ]);
        const app = createApp({ compartments: new MongoCompartmentRepository() });

        const res = await request(app).get('/locker');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            compartments: [
                { id: 'C01', size: 'S', status: 'free', parcelId: null},
                { id: 'C02', size: 'M', status: 'occupied', parcelId: 'P1' },
            ],
        });
    });
});