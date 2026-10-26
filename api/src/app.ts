import express from 'express';
import { pinoHttp } from 'pino-http';
import { logger } from './logger.js';
import type { CompartmentRepository } from './domain/compartment-repository.js';
import type { ParcelRepository } from './domain/parcel-repository.js';
import { errorHandler } from './http/error-handler.js';
import { lockerRouter } from './http/locker-routes.js';
import { parcelRouter } from './http/parcel-routes.js';
import { LockerService } from './application/locker-service.js';
import type { EventRepository } from './domain/event-repository.js';
import { eventRouter } from './http/event-routes.js';

export interface AppDependencies {
    compartments: CompartmentRepository;
    parcels: ParcelRepository;
    events: EventRepository;
}

export function createApp(deps: AppDependencies) {
    const app= express();
    const locker = new LockerService(deps.compartments, deps.parcels, deps.events);

    app.use(
        pinoHttp({
            logger,
            customLogLevel: (_req, res, err) => {
                if (err || res.statusCode >= 500) return 'error';
                if (res.statusCode >= 400) return 'warn';
                return 'info';
            },
        }),
    );

    app.use(express.json());

    app.get('/health', (_req, res) => {
        res.json({ status: 'ok'});
    });

    app.use(lockerRouter(deps.compartments));
    app.use(parcelRouter(deps.parcels, locker));
    app.use(eventRouter(deps.events));

    app.use(errorHandler);
    
    return app;
}