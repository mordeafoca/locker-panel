import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { CompartmentModel } from '../src/infra/compartment-model.js';
import { EventModel } from '../src/infra/event-model.js';
import { buildApp } from './helpers/build-app.js';
import { useTestDatabase } from './helpers/test-database.js';

useTestDatabase();

describe('GET /events', () => {
  it('regista criar, colocar e levantar, do mais recente para o mais antigo', async () => {
    await CompartmentModel.create({ _id: 'C01', size: 'M', status: 'free', parcelId: null });
    const app = buildApp();
    await request(app).post('/parcels').send({ id: 'P1', size: 'S', carrier: 'rapidex' });
    await request(app).post('/parcels/P1/place');
    await request(app).post('/parcels/P1/pick-up');

    const res = await request(app).get('/events');

    expect(res.status).toBe(200);
    expect(res.body.events).toMatchObject([
      { type: 'parcel_picked_up', parcelId: 'P1', carrier: 'rapidex', compartmentId: 'C01' },
      { type: 'parcel_placed', parcelId: 'P1', carrier: 'rapidex', compartmentId: 'C01' },
      { type: 'parcel_created', parcelId: 'P1', carrier: 'rapidex', compartmentId: null },
    ]);
  });

  it('não regista nada quando a ação falha ou é repetida', async () => {
    await CompartmentModel.create({ _id: 'C01', size: 'S', status: 'free', parcelId: null });
    const app = buildApp();
    await request(app).post('/parcels').send({ id: 'P1', size: 'S', carrier: 'rapidex' });
    await request(app).post('/parcels').send({ id: 'P1', size: 'S', carrier: 'rapidex' });
    await request(app).post('/parcels/P1/place');
    await request(app).post('/parcels/P1/place');

    expect(await EventModel.countDocuments()).toBe(2);
  });

  it('respeita o limite e rejeita limites inválidos', async () => {
    const app = buildApp();
    for (const id of ['P1', 'P2', 'P3']) {
      await request(app).post('/parcels').send({ id, size: 'S', carrier: 'andorinha' });
    }

    const res = await request(app).get('/events?limit=2');

    expect(res.body.events).toHaveLength(2);
    expect((await request(app).get('/events?limit=0')).status).toBe(400);
  });
});