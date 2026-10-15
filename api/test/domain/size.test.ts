import { describe, it, expect } from 'vitest';
import { fits } from '../../src/domain/size.js';

describe('fits', () => {
    it.each([
        ['S', 'S', true], ['S', 'M', true], ['S', 'L', true],
        ['M', 'S', false], ['M', 'M', true], ['M', 'L', true],
        ['L', 'S', false], ['L', 'M', false], ['L', 'L', true]
    ] as const)('encomenda %s em comportimento %s -> %s', (parcel, compartment, expected) => {
        expect(fits(parcel, compartment)).toBe(expected);
    });
});