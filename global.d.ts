import mongoose from 'mongoose';

declare global {
  var mongooseConn: typeof mongoose | null;
}

export {};
