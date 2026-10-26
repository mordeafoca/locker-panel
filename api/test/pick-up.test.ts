import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { CompartmentModel } from '../src/infra/compartment-model.js';
import { ParcelModel } from '../src/infra/parcel-model.js';
import { buildApp } from './helpers/build-app.js';
import { useTestDatabase } from './helpers/test-database.js';

useTestDatabase();

async function givenPlacedParcel(parcelId: string, compartmentId: string) {
  await CompartmentModel.create({ _id: compartmentId, size: 'M', status: 'occupied', parcelId });
  await ParcelModel.create({ _id: parcelId, size: 'M', carrier: 'rapidex', status: 'placed', compartmentId });
}

describe('POST /parcels/:id/pick-up', () => {
  it('liberta o compartimento e marca a encomenda como levantada', async () => {
    await givenPlacedParcel('P1', 'C01');

    const res = await request(buildApp()).post('/parcels/P1/pick-up');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 'P1', status: 'picked_up' });
    expect(await CompartmentModel.findById('C01').lean()).toMatchObject({
      status: 'free', parcelId: null,
    });
  });

  it('é idempotente: levantar duas vezes devolve 200', async () => {
    await givenPlacedParcel('P1', 'C01');
    const app = buildApp();
    await request(app).post('/parcels/P1/pick-up');

    const res = await request(app).post('/parcels/P1/pick-up');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('picked_up');
  });

  it('devolve 409 para uma encomenda que ainda não foi colocada', async () => {
    await ParcelModel.create({ _id: 'P1', size: 'S', carrier: 'rapidex', status: 'created', compartmentId: null });

    const res = await request(buildApp()).post('/parcels/P1/pick-up');

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: 'PARCEL_NOT_PLACED' });
  });

  it('devolve 404 para uma encomenda que não existe', async () => {
    const res = await request(buildApp()).post('/parcels/NAO-EXISTE/pick-up');

    expect(res.status).toBe(404);
  });
});