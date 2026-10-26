import { Router } from 'express';
import { z } from 'zod';
import { CARRIERS } from '../domain/parcel.js';
import type { ParcelRepository } from '../domain/parcel-repository.js';
import { SIZES } from '../domain/size.js';
import type { LockerService } from '../application/locker-service.js';
import { PARCEL_STATUSES } from '../domain/parcel.js';

const createParcelSchema = z.object({
    id: z.string().trim().min(1).max(64),
    size: z.enum(SIZES),
    carrier: z.enum(CARRIERS),
});

const placeParcelSchema = z.object({
    compartmentId: z.string().min(1).optional(),
});

const listParcelsSchema = z.object({
    carrier: z.enum(CARRIERS).optional(),
    status: z.enum(PARCEL_STATUSES).optional(),
});

export function parcelRouter(parcels: ParcelRepository, locker: LockerService): Router {
    const router = Router();

    router.post('/parcels', async (req, res) => {
        const input = createParcelSchema.parse(req.body);
        const parcel = await locker.createParcel(input);
        res.status(201).json(parcel);
    });

    router.post('/parcels/:id/place', async (req, res) => {
        const { compartmentId } = placeParcelSchema.parse(req.body ?? {});
        const parcel = await locker.placeParcel(req.params.id, compartmentId);
        res.json(parcel);
    });

    router.get('/parcels', async (req,res) => {
        const filter = listParcelsSchema.parse(req.query);
        res.json({ parcels: await parcels.findAll(filter)});
    });

    router.post('/parcels/:id/pick-up', async (req, res) => {
        const parcel = await locker.pickUpParcel(req.params.id);
        res.json(parcel);
    });

    return router;
}