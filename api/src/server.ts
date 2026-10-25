import mongoose from "mongoose";
import { createApp } from "./app.js";
import { config } from './config.js';
import { MongoCompartmentRepository } from "./infra/mongo-compartment-repository.js";
import { MongoParcelRepository } from "./infra/mongo-parcel-repository.js";
import { seedCompartments } from "./infra/seed.js";

await mongoose.connect(config.mongoUrl);
await seedCompartments();

const app = createApp({ 
    compartments: new MongoCompartmentRepository(),
    parcels: new MongoParcelRepository(),
});


app.listen(config.port, () => {
    console.log(`API em http://localhost:${config.port}`);
});