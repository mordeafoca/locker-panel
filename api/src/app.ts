import express from 'express';
import type { CompartmentRepository } from './domain/compartment-repository.js';
import type { ParcelRepository } from './domain/parcel-repository.js';
import { errorHandler } from './http/error-handler.js';
import { lockerRouter } from './http/locker-routes.js';
import { parcelRouter } from './http/parcel-routes.js';

export interface AppDependencies {
    compartments: CompartmentRepository;
    parcels: ParcelRepository;
}

export function createApp(deps: AppDependencies) {
    const app= express();
    app.use(express.json());

    app.get('/health', (_req, res) => {
        res.json({ status: 'ok'});
    });

    app.use(lockerRouter(deps.compartments));
    app.use(parcelRouter(deps.parcels));

    app.use(errorHandler);
    
    return app;
}