import { Router } from 'express';
import { z } from 'zod';
import { CARRIERS, newParcel } from '../domain/parcel.js';
import type { ParcelRepository } from '../domain/parcel-repository.js';
import { SIZES } from '../domain/size.js';
import type { LockerService } from '../application/locker-service.js';

const createParcelSchema = z.object({
    id: z.string().trim().min(1).max(64),
    size: z.enum(SIZES),
    carrier: z.enum(CARRIERS),
});

const placeParcelSchema = z.object({
    compartmentId: z.string().min(1).optional(),
});

export function parcelRouter(parcels: ParcelRepository, locker: LockerService): Router {
    const router = Router();

    router.post('/parcels', async (req, res) => {
        const input = createParcelSchema.parse(req.body);
        const parcel = newParcel(input);
        await parcels.create(parcel);
        res.status(201).json(parcel);
    });

    router.post('/parcels/:id/place', async (req, res) => {
        const { compartmentId } = placeParcelSchema.parse(req.body ?? {});
        const parcel = await locker.placeParcel(req.params.id, compartmentId);
        res.json(parcel);
    });

    return router;
}