import mongoose from "mongoose";
import { createApp } from "./app.js";
import { config } from './config.js';
import { MongoCompartmentRepository } from "./infra/mongo-compartment-repository.js";
import { MongoParcelRepository } from "./infra/mongo-parcel-repository.js";
import { seedCompartments } from "./infra/seed.js";
import { logger } from "./logger.js";
import { MongoEventRepository } from "./infra/mongo-event-repository.js";

await mongoose.connect(config.mongoUrl);
await seedCompartments();

const app = createApp({ 
    compartments: new MongoCompartmentRepository(),
    parcels: new MongoParcelRepository(),
    events: new MongoEventRepository(),
});


app.listen(config.port, () => {
      logger.info({ port: config.port }, 'api listening');
});