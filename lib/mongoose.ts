import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;
let cached = (global as any).mongooseConn || null;

export async function connectDB() {
  if (cached) return cached;
  cached = await mongoose.connect(MONGODB_URI, {
    dbName: 'myDB',
    bufferCommands: false,
  });
  (global as any).mongooseConn = cached;
  return cached;
}