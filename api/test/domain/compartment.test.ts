import { describe, it, expect } from 'vitest';
import { placeParcel, type Compartment } from '../../src/domain/compartment.js';

function makeCompartment(overrides: Partial<Compartment> = {}): Compartment {
    return { id:'C1', size:'M', status:'free', parcelId: null, ...overrides };
}

describe('placeParcel', () => {
    it('ocupa um compartimento livre do mesmo tamanho', () => {
        const result = placeParcel(makeCompartment(), { id:'P1', size:'M'});

        expect(result).toEqual({ id:'C1', size:'M', status:'occupied', parcelId: 'P1'});
    });

    it('aceita uma encomenda mais pequena do que o compartimento', () => {
    const result = placeParcel(makeCompartment({ size: 'L' }), { id: 'P1', size: 'S' });

    expect(result.status).toBe('occupied');
  });

  it('não altera o compartimento original', () => {
    const original = makeCompartment();

    placeParcel(original, { id: 'P1', size: 'M' });

    expect(original.status).toBe('free');
    expect(original.parcelId).toBeNull();
  });

  it('rejeita uma encomenda maior do que o compartimento', () => {
    const small = makeCompartment({ size: 'S' });

    expect(() => placeParcel(small, { id: 'P1', size: 'M' }))
      .toThrow(expect.objectContaining({ code: 'PARCEL_TOO_LARGE' }));
  });

  it('rejeita um compartimento ocupado por outra encomenda', () => {
    const occupied = makeCompartment({ status: 'occupied', parcelId: 'P2' });

    expect(() => placeParcel(occupied, { id: 'P1', size: 'M' }))
      .toThrow(expect.objectContaining({ code: 'COMPARTMENT_OCCUPIED' }));
  });

  it('rejeita um compartimento fora de serviço', () => {
    const broken = makeCompartment({ status: 'out_of_service' });

    expect(() => placeParcel(broken, { id: 'P1', size: 'M' }))
      .toThrow(expect.objectContaining({ code: 'COMPARTMENT_OUT_OF_SERVICE' }));
  });

  it('é idempotente: repetir a mesma colocação não dá erro', () => {
    const occupied = makeCompartment({ status: 'occupied', parcelId: 'P1' });

    expect(placeParcel(occupied, { id: 'P1', size: 'M' })).toEqual(occupied);
  });
});