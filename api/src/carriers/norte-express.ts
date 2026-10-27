import { z } from 'zod';
import type { CarrierAdapter } from './carrier-adapter.js';

//Norte Express: { "shipment": {"id": "NX-7781", "sizeCode": 2}}

const schema = z.object({
    shipment: z.object({
        id: z.string().trim().min(1).max(64),
        sizeCode: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    }),
});

const SIZES = { 1: 'S', 2: 'M', 3: 'L'} as const;

export const norteExpressAdapter: CarrierAdapter = {
    carrier: 'norte-express',
    toParcel(payload) {
        const { shipment } = schema.parse(payload);
        return { id: shipment.id, size: SIZES[shipment.sizeCode], carrier: 'norte-express'};
    },
};