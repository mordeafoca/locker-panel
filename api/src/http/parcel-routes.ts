import { Router } from 'express';
import { z } from 'zod';
import { CARRIERS, newParcel } from '../domain/parcel.js';
import type { ParcelRepository } from '../domain/parcel-repository.js';
import { SIZES } from '../domain/size.js';

const createParcelSchema = z.object({
    id: z.string().trim().min(1).max(64),
    size: z.enum(SIZES),
    carrier: z.enum(CARRIERS),
});

export function parcelRouter(parcels: ParcelRepository): Router {
    const router = Router();

    router.post('/parcels', async (req, res) => {
        const input = createParcelSchema.parse(req.body);
        const parcel = newParcel(input);
        await parcels.create(parcel);
        res.status(201).json(parcel);
    });

    return router;
}