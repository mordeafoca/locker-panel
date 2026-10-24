import mongoose from "mongoose";
import { createApp } from "./app.js";
import { config } from './config.js';
import { seedCompartments } from "./infra/seed.js";

await mongoose.connect(config.mongoUrl);
await seedCompartments();

createApp().listen(config.port, () => {
    console.log(`API em http://localhost:${config.port}`);
});