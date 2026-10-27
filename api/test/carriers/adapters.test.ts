import { describe, it, expect } from 'vitest';
import { andorinhaAdapter, sizeFromDimensions } from '../../src/carriers/andorinha.js';
import { norteExpressAdapter } from '../../src/carriers/norte-express.js';
import { rapidexAdapter } from '../../src/carriers/rapidex.js';

describe('rapidexAdapter', () => {
  it('traduz ref e parcel_size', () => {
    expect(rapidexAdapter.toParcel({ ref: 'PT-1', parcel_size: 'medium' })).toEqual({
      id: 'PT-1', size: 'M', carrier: 'rapidex',
    });
  });

  it('rejeita um tamanho que não conhece', () => {
    expect(() => rapidexAdapter.toParcel({ ref: 'PT-1', parcel_size: 'huge' })).toThrow();
  });
});

describe('norteExpressAdapter', () => {
  it('traduz o formato aninhado com código numérico', () => {
    expect(norteExpressAdapter.toParcel({ shipment: { id: 'NX-1', sizeCode: 3 } })).toEqual({
      id: 'NX-1', size: 'L', carrier: 'norte-express',
    });
  });

  it('rejeita um sizeCode fora de 1 a 3', () => {
    expect(() => norteExpressAdapter.toParcel({ shipment: { id: 'NX-1', sizeCode: 4 } })).toThrow();
  });
});

describe('andorinhaAdapter', () => {
  it('calcula o tamanho a partir das dimensões', () => {
    const payload = { codigo: 'AN-1', dimensoes: { largura: 30, altura: 15, profundidade: 25 } };

    expect(andorinhaAdapter.toParcel(payload)).toEqual({ id: 'AN-1', size: 'M', carrier: 'andorinha' });
  });
});

describe('sizeFromDimensions', () => {
  it.each([
    [[30, 8, 25], 'S'],
    [[30, 10, 25], 'S'],
    [[30, 11, 25], 'M'],
    [[25, 30, 28], 'L'],
    [[8, 50, 30], 'S'],
  ] as const)('%j cabe em %s', (dimensions, expected) => {
    expect(sizeFromDimensions([...dimensions])).toBe(expected);
  });

  it.each([
    [[35, 35, 35]],
    [[5, 45, 45]],
    [[5, 30, 70]],
  ])('%j não cabe em nenhum compartimento', (dimensions) => {
    expect(() => sizeFromDimensions(dimensions)).toThrow(
      expect.objectContaining({ code: 'PARCEL_TOO_LARGE' }),
    );
  });
});