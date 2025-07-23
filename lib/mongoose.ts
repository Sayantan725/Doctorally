import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;
let cached = globalThis.mongooseConn || null;

export async function connectDB() {
  if (cached) return cached;
  cached = await mongoose.connect(MONGODB_URI, {
    dbName: 'reportImages',
    bufferCommands: false,
  });
  globalThis.mongooseConn = cached;
  return cached;
}