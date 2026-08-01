import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env file");
}

declare global {
  var mongooseCache: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
}

const cached =
  global.mongooseCache ?? {
    conn: null,
    promise: null,
  };

global.mongooseCache = cached;

export async function connectDB(): Promise<Mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI as string, {
      family: 4, // Forces IPv4 to prevent getaddrinfo ENOTFOUND issues
      serverSelectionTimeoutMS: 15000, // Wait up to 15 seconds for server selection
    }).then((m) => m);
  }

  cached.conn = await cached.promise;
  console.log("MongoDB connected");

  return cached.conn;
}