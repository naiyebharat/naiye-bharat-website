// @ts-check
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_DB_URI;

if (!MONGO_URI) {
  throw new Error('Please define the MONGO_DB_URI environment variable inside .env.local');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {

  if (cached.conn) {
    if (!(global as any).hasRunMigration) {
      (global as any).hasRunMigration = true;
      try {
        const db = mongoose.connection.db;
        if (db) {
          console.log("Running index migration inside cached connection... 🔄");
          // 1. Clean up legacy draft orders where razorpayOrderId is explicitly null
          const deleteResult = await db.collection("orders").deleteMany({ razorpayOrderId: null });
          if (deleteResult.deletedCount > 0) {
            console.log(`Cleaned up ${deleteResult.deletedCount} legacy draft orders with null razorpayOrderId. 🧹`);
          }

          // 2. Drop the existing razorpayOrderId_1 index so Mongoose can rebuild it with the sparse option
          await db.collection("orders").dropIndex("razorpayOrderId_1");
          console.log("Outdated index razorpayOrderId_1 dropped successfully. Re-syncing sparse index... 🔄");
        }
      } catch (err: any) {
        console.log("Migration Note: Index drop/cleanup completed or not needed in cached conn.");
      }
    }
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log("Creating new database connection connection pool... ⏳");
    cached.promise = mongoose.connect(MONGO_URI, opts).then(async (mongooseInstance) => {
      console.log("Database connected successfully ✅");
      try {
        const db = mongooseInstance.connection.db;
        if (db) {
          // 1. Clean up legacy draft orders where razorpayOrderId is explicitly null
          const deleteResult = await db.collection("orders").deleteMany({ razorpayOrderId: null });
          if (deleteResult.deletedCount > 0) {
            console.log(`Cleaned up ${deleteResult.deletedCount} legacy draft orders with null razorpayOrderId. 🧹`);
          }

          // 2. Drop the existing razorpayOrderId_1 index so Mongoose can rebuild it with the sparse option
          await db.collection("orders").dropIndex("razorpayOrderId_1");
          console.log("Outdated index razorpayOrderId_1 dropped successfully. Re-syncing sparse index... 🔄");
        }
      } catch (err: any) {
        console.log("Note: Database index/draft cleanup finished (either already sparse or no legacy index to drop).");
      }
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("Failed to connect database ❌", e);
    throw e;
  }

  return cached.conn;
};