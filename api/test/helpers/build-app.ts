import { createApp } from "../../src/app.js";
import { MongoCompartmentRepository } from "../../src/infra/mongo-compartment-repository.js";
import { MongoParcelRepository } from "../../src/infra/mongo-parcel-repository.js";
import { MongoEventRepository } from "../../src/infra/mongo-event-repository.js";
import type { ChangeNotifier } from '../../src/domain/change-notifier.js';
import { InMemoryNotifier } from '../../src/infra/in-memory-notifier.js';

export function buildApp(notifier: ChangeNotifier = new InMemoryNotifier) {
    return createApp({
        compartments: new MongoCompartmentRepository(),
        parcels: new MongoParcelRepository(),
        events: new MongoEventRepository(),
        notifier,
    });
}