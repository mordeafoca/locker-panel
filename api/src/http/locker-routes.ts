import { Router } from 'express';
import type { CompartmentRepository } from '../domain/compartment-repository.js';

export function lockerRouter(compartments: CompartmentRepository): Router {
    const router = Router();

    router.get('/locker', async (_req, res) => {
        const all = await compartments.findAll();
        res.json({ compartments:all });
    });

    return router;
}