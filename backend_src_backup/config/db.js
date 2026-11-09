import mongoose from 'mongoose';
import { env } from './env.js';

/**
 * Connects to MongoDB.
 * - USE_MEMORY_DB=true  -> starts a throw-away in-memory database (great for first run)
 * - otherwise           -> connects to MONGODB_URI
 * Returns true when an in-memory DB was used (so the caller can seed demo data).
 */
export async function connectDB() {
  mongoose.set('strictQuery', true);

  if (env.useMemoryDb) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const memoryServer = await MongoMemoryServer.create();
    await mongoose.connect(memoryServer.getUri('parqco'));
    console.log('✔ Connected to in-memory MongoDB (data resets on restart)');
    return true;
  }

  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log(`✔ Connected to MongoDB at ${env.mongoUri}`);
    return false;
  } catch (error) {
    console.error('✖ Could not connect to MongoDB:', error.message);
    console.error('  Start MongoDB, or set USE_MEMORY_DB=true in backend/.env');
    process.exit(1);
  }
}
