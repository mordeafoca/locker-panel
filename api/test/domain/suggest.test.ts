import { describe, it, expect } from "vitest";
import type { Compartment } from '../../src/domain/compartment.js';
import { suggestCompartment } from '../../src/domain/suggest.js';

function makeCompartment(overrides: Partial<Compartment> = {}): Compartment {
    return { id: 'C1', size: 'M', status: 'free', parcelId: null, ...overrides };
}

describe('suggestCompartment', () => {
    it('sugere o compartimento livre mais pequeno onde a encomenda cabe', () => {
        const compartments = [
            makeCompartment({ id: 'L1', size: 'L'}),
            makeCompartment({ id: 'M1', size: 'M'}),
            makeCompartment({ id: 'S1', size: 'S'}),
        ];

        expect(suggestCompartment(compartments, 'M')?.id).toBe('M1');
    });

    it('passa para um tamanho maior se não houver do mesmo tamanho livre', () => {
        const compartments = [
            makeCompartment({ id: 'M1', size: 'M', status: 'occupied', parcelId: 'P9'}),
            makeCompartment({ id: 'L1', size: 'L'}),
        ];

        expect(suggestCompartment(compartments, 'M')?.id).toBe('L1');
    });

    it('ignora compartimentos fora de serviço', () => {
        const compartments = [
            makeCompartment({ id: 'S1', size: 'S', status:'out_of_service'}),
            makeCompartment({ id: 'M1', size: 'M' }),
        ];

        expect(suggestCompartment(compartments, 'S')?.id).toBe('M1');
    });

    it('devolve null quando não há nenhum compartimento possível', () => {
        const compartments = [makeCompartment({ id: 'S1', size: 'S'})];

        expect(suggestCompartment(compartments, 'L')).toBeNull();
    });

    it('em caso de empate, mantem o primeiro da lista', () => {
        const compartments = [
            makeCompartment({ id: 'M1', size: 'M' }),
            makeCompartment({ id: 'M2', size: 'M'}),
        ];

        expect(suggestCompartment(compartments, 'S')?.id).toBe('M1');
    });
});