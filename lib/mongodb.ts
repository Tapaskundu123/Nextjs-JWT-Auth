// lib/mongodb.ts
import mongoose from "mongoose";

// Proper typing for the cached connection
type MongooseCache = {
  conn: mongoose.Mongoose | null;
  promise: Promise<mongoose.Mongoose> | null;
};

// Use `globalThis` with proper typing (recommended in Next.js)
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

// Initialize cache (persists across hot reloads in dev)
const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

export const connectDB = async (): Promise<void> => {
  // Reuse existing connection
  if (cached.conn) {
    console.log("➜ Using existing MongoDB connection");
    return;
  }

  // Critical: Check for MONGODB_URI
  if (!process.env.MONGODB_URI) {
    console.error("❌ Missing MONGODB_URI in .env.local");
    throw new Error("Please define MONGODB_URI in your .env.local file");
  }

  try {
    // Only create promise once
    if (!cached.promise) {
      const opts = {
        bufferCommands: false, // Good practice
      };

      cached.promise = mongoose.connect(process.env.MONGODB_URI!, opts);
    }

    // Await connection
    cached.conn = await cached.promise;

    // Event listeners (only once)
    cached.conn.connection.on("connected", () => {
      console.log("✅ MongoDB connected successfully");
    });

    cached.conn.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    cached.conn.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });

    // Persist cache globally for hot reloads
    global.mongoose = cached;
  } catch (error: any) {
    cached.promise = null; // Reset on failure
    console.error("Failed to connect to MongoDB:", error.message);
    throw new Error(`Database connection failed: ${error.message}`);
  }
};