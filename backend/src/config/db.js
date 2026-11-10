import mongoose from 'mongoose';
import { env } from './env.js';

/** Hides the password so the connection string can be logged safely. */
const maskUri = (uri) => String(uri).replace(/\/\/([^:@/]+):([^@/]+)@/, '//$1:***@');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Turns a driver error into a hint the developer can act on. */
function hintFor(error) {
  const text = String(error?.message ?? '');
  if (/bad auth|authentication failed/i.test(text)) {
    return 'The database user or password is wrong (Atlas > Database Access).';
  }
  if (/ENOTFOUND|querySrv/i.test(text)) {
    return 'The host in the connection string was not found. Copy the string again from Atlas > Connect > Drivers.';
  }
  if (/ServerSelection|timed out|ECONNREFUSED/i.test(text)) {
    return env.isProduction
      ? 'Atlas is not reachable. Allow 0.0.0.0/0 under Network Access and check the connection string.'
      : 'Start MongoDB, or set USE_MEMORY_DB=true in backend/.env';
  }
  return null;
}

/**
 * Connects to MongoDB.
 * - USE_MEMORY_DB=true  -> starts a throw-away in-memory database (local first run only)
 * - otherwise           -> connects to MONGODB_URI (production retries a few times)
 * Returns true when an in-memory DB was used (so the caller can seed demo data).
 */
export async function connectDB() {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('error', (error) => console.error('✖ MongoDB error:', error.message));
  mongoose.connection.on('disconnected', () => console.warn('⚠ MongoDB disconnected'));
  mongoose.connection.on('reconnected', () => console.log('✔ MongoDB reconnected'));

  if (env.useMemoryDb) {
    if (env.isProduction) {
      // An in-memory database loses all data on every restart, so it must never run on the live site.
      console.error('✖ USE_MEMORY_DB is turned on in production. Remove it and set MONGODB_URI instead.');
      process.exit(1);
    }
    // Loaded only when needed: this is a dev dependency and is not installed on the host.
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const memoryServer = await MongoMemoryServer.create();

    await mongoose.connect(memoryServer.getUri('parqco'));
    console.log('✔ Connected to in-memory MongoDB (data resets on restart)');
    return true;
  }

  if (!env.mongoUri) {
    console.error('✖ MONGODB_URI is not set. Add it to backend/.env (or to the environment variables on the host).');
    process.exit(1);
  }

  const attempts = env.isProduction ? 3 : 1;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: env.isProduction ? 10000 : 5000 });
      console.log(`✔ Connected to MongoDB at ${maskUri(env.mongoUri)}`);
      return false;
    } catch (error) {
      console.error(`✖ Could not connect to MongoDB (attempt ${attempt}/${attempts}):`, error.message);
      if (attempt < attempts) {
        await wait(3000);
        continue;
      }
      const hint = hintFor(error);
      if (hint) console.error(`  ${hint}`);
      process.exit(1);
    }
  }
  return false;
}