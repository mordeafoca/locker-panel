import express from 'express';
import type { CompartmentRepository } from './domain/compartment-repository.js';
import { lockerRouter } from './http/locker-routes.js';

export interface AppDependencies {
    compartments: CompartmentRepository;
}

export function createApp(deps: AppDependencies) {
    const app= express();
    app.use(express.json());

    app.get('/health', (_req, res) => {
        res.json({ status: 'ok'});
    });

    app.use(lockerRouter(deps.compartments));

    return app;
}