export const config = {
    port: Number(process.env.PORT ?? 3000),
    mongoUrl: process.env.MONGO_URL ?? 'mongodb://localhost:27017/locker',
};