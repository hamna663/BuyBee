import mongoose, { Connection, connection } from "mongoose";

const MONGODB_URI: string = process.env.MONGODB_URI!;
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectToDatabase = async (): Promise<Connection> => {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        maxPoolSize: 10,
        bufferCommands: false,
      })
      .then(() => connection);
  }

  cached.conn = await cached.promise;
  return cached.conn;
};
