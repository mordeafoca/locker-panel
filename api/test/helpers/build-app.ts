import { createApp } from "../../src/app.js";
import { MongoCompartmentRepository } from "../../src/infra/mongo-compartment-repository.js";
import { MongoParcelRepository } from "../../src/infra/mongo-parcel-repository.js";

export function buildApp() {
    return createApp({
        compartments: new MongoCompartmentRepository(),
        parcels: new MongoParcelRepository(),
    });
}