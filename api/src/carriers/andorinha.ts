import { z } from 'zod';
import { DomainError } from '../domain/errors.js';
import type { Size } from '../domain/size.js';
import type { CarrierAdapter } from './carrier-adapter.js';

/**
 * Andorinha does not send a size, only the box dimensions in centimetres:
 * { "codigo": "AN-3302", "dimensoes": {"largura": 30, "altura": 8, "profundidade": 25}}
 * 
 */

const schema = z.object({
    codigo: z.string().trim().min(1).max(64),
    dimensoes: z.object({
        largura: z.number().positive(),
        altura: z.number().positive(),
        profundidade: z.number().positive(), 
    }),
});

//All compartments are 40cm wide and 60cm deep, they differ in height
const MAX_WIDTH= 40;
const MAX_DEPTH= 60;
const MAX_HEIGHT: [Size, number][] = [
    ['S', 10],
    ['M', 20],
    ['L', 30],
];

export function sizeFromDimensions(dimensions: number[]): Size {
    //The parcel can be laid on its largest side, so the smallest dimension is the height

    const [height, width, depth] = [...dimensions].sort((a,b) => a - b );
    if(width > MAX_WIDTH || depth > MAX_DEPTH) {
        throw new DomainError('PARCEL_TOO_LARGE');
    }
    const match = MAX_HEIGHT.find(([, max]) => height <= max);
    if(!match){
        throw new DomainError('PARCEL_TOO_LARGE');
    }
    return match[0];
}

export const andorinhaAdapter: CarrierAdapter = {
    carrier: 'andorinha',
    toParcel(payload) {
        const { codigo, dimensoes } = schema.parse(payload);
        const size = sizeFromDimensions([dimensoes.largura, dimensoes.altura, dimensoes.profundidade]);
        return { id: codigo, size, carrier: 'andorinha'};
    },
};