import { Router } from 'express';
import { z } from 'zod';
import type { EventRepository } from '../domain/event-repository.js';

const listEventsSchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

export function eventRouter (events: EventRepository): Router {
    const router = Router();

    router.get('/events', async (req, res) => {
        const { limit } = listEventsSchema.parse(req.query);
        res.json({ events: await events.latest(limit) });
    });

    return router;
}