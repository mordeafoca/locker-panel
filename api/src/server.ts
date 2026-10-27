import mongoose from "mongoose";
import { createApp } from "./app.js";
import { config } from './config.js';
import { MongoCompartmentRepository } from "./infra/mongo-compartment-repository.js";
import { MongoParcelRepository } from "./infra/mongo-parcel-repository.js";
import { seedCompartments } from "./infra/seed.js";
import { logger } from "./logger.js";
import { MongoEventRepository } from "./infra/mongo-event-repository.js";
import type { ChangeNotifier } from "./domain/change-notifier.js";
import { InMemoryNotifier } from "./infra/in-memory-notifier.js";
import { RedisNotifier } from "./infra/redis-notifier.js";

await mongoose.connect(config.mongoUrl);
await seedCompartments();

const notifier: ChangeNotifier = config.redisUrl
  ? await RedisNotifier.connect(config.redisUrl)
  : new InMemoryNotifier();
logger.info({ notifier: config.redisUrl ? 'redis' : 'in-memory' }, 'change notifier ready');

const app = createApp({ 
    compartments: new MongoCompartmentRepository(),
    parcels: new MongoParcelRepository(),
    events: new MongoEventRepository(),
    notifier,
});


app.listen(config.port, () => {
      logger.info({ port: config.port }, 'api listening');
});