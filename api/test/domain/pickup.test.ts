import { describe, it, expect } from "vitest";
import { pickUpParcel, type Compartment} from '../../src/domain/compartment.js';

function makeCompartment(overrides: Partial<Compartment> = {}): Compartment {
    return { id: 'C1', size: 'M', status: 'free', parcelId: null, ...overrides};
}

describe('pickUpParcel', () => {
    it('liberta o compartimento quando a encomenda é levantada', () => {
        const occupied = makeCompartment({ status: 'occupied', parcelId: 'P1'});

        expect(pickUpParcel(occupied, 'P1')).toEqual(makeCompartment());
    });

    it('rejeita levantar uma encomenda que não está neste compartimento', () => {
        const occupied = makeCompartment({ status: 'occupied', parcelId: 'P2'});

        expect(() => pickUpParcel(occupied, 'P1'))
            .toThrow(expect.objectContaining({ code: 'PARCEL_NOT_IN_COMPARTMENT'}));
    });

  it('rejeita levantar de um compartimento vazio', () => {
    expect(() => pickUpParcel(makeCompartment(), 'P1'))
      .toThrow(expect.objectContaining({ code: 'PARCEL_NOT_IN_COMPARTMENT' }));
  });

    it('mantém o compartimento fora de serviço se já estava', () => {
        const broken = makeCompartment({status: 'out_of_service', parcelId: 'P1'});

        expect(pickUpParcel(broken, 'P1').status).toBe('out_of_service');
    });
});