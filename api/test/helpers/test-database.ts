import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { afterAll, afterEach, beforeAll } from 'vitest';

export function useTestDatabase(): void {
    let server: MongoMemoryServer;

    beforeAll(async () => {
        server = await MongoMemoryServer.create();
        await mongoose.connect(server.getUri());
    });

    afterEach(async () => {
        await mongoose.connection.db?.dropDatabase();
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await server.stop();
    });
}