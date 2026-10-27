import { z } from 'zod';
import type { CarrierAdapter } from './carrier-adapter.js';

//Rapidex: { "ref": "PT-0141", "parcel_size": "small"}
const schema = z.object({
    ref: z.string().trim().min(1).max(64),
    parcel_size: z.enum(['small', 'medium', 'large']),
});

const SIZES = { small: 'S', medium: 'M', large: 'L'} as const;

export const rapidexAdapter: CarrierAdapter = {
    carrier: 'rapidex',
    toParcel(payload) {
        const { ref, parcel_size } = schema.parse(payload);
        return { id: ref, size: SIZES[parcel_size], carrier: 'rapidex'};
    },
};