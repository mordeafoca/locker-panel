import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import { ParcelModel } from '../src/infra/parcel-model.js';
import { buildApp } from './helpers/build-app.js';
import { useTestDatabase } from './helpers/test-database.js';

useTestDatabase();

describe('GET /parcels', () => {
  beforeEach(async () => {
    await ParcelModel.insertMany([
      { _id: 'P1', size: 'S', carrier: 'rapidex', status: 'created', compartmentId: null },
      { _id: 'P2', size: 'M', carrier: 'andorinha', status: 'placed', compartmentId: 'C07' },
      { _id: 'P3', size: 'L', carrier: 'rapidex', status: 'placed', compartmentId: 'C11' },
    ]);
  });

  it('lista todas as encomendas', async () => {
    const res = await request(buildApp()).get('/parcels');

    expect(res.status).toBe(200);
    expect(res.body.parcels.map((p: { id: string }) => p.id)).toEqual(['P1', 'P2', 'P3']);
  });

  it('filtra por transportadora e estado', async () => {
    const res = await request(buildApp()).get('/parcels?carrier=rapidex&status=placed');

    expect(res.body.parcels.map((p: { id: string }) => p.id)).toEqual(['P3']);
  });

  it('rejeita um filtro inválido com 400', async () => {
    const res = await request(buildApp()).get('/parcels?carrier=dhl');

    expect(res.status).toBe(400);
  });
});