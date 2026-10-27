import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { ParcelModel } from '../src/infra/parcel-model.js';
import { buildApp } from './helpers/build-app.js';
import { useTestDatabase } from './helpers/test-database.js';

useTestDatabase();

describe('POST /carriers/:carrier/parcels', () => {
  it('cria a encomenda a partir do formato da transportadora', async () => {
    const res = await request(buildApp())
      .post('/carriers/norte-express/parcels')
      .send({ shipment: { id: 'NX-1', sizeCode: 2 } });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 'NX-1', size: 'M', carrier: 'norte-express', status: 'created' });
    expect(await ParcelModel.findById('NX-1')).not.toBeNull();
  });

  it('devolve 404 para uma transportadora desconhecida', async () => {
    const res = await request(buildApp()).post('/carriers/dhl/parcels').send({});

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'CARRIER_NOT_FOUND' });
  });

  it('devolve 400 quando o formato não é o da transportadora', async () => {
    const res = await request(buildApp())
      .post('/carriers/rapidex/parcels')
      .send({ shipment: { id: 'NX-1', sizeCode: 2 } });

    expect(res.status).toBe(400);
  });

  it('devolve 422 quando as dimensões não cabem no locker', async () => {
    const res = await request(buildApp())
      .post('/carriers/andorinha/parcels')
      .send({ codigo: 'AN-1', dimensoes: { largura: 50, altura: 50, profundidade: 50 } });

    expect(res.status).toBe(422);
  });
});