import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { CompartmentModel } from '../src/infra/compartment-model.js';
import { useTestDatabase } from './helpers/test-database.js';
import { buildApp } from './helpers/build-app.js';

useTestDatabase();

describe('GET /locker', () => {
    it('devolve os compartimentos odenados, com id em vez de _id', async () => {
        await CompartmentModel.insertMany([
            { _id: 'C02', size: 'M', status: 'occupied', parcelId: 'P1'},
            { _id: 'C01', size: 'S', status: 'free', parcelId: null },
        ]);
        const app = buildApp();

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