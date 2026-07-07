import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL!, {
  max: 15,          // pool size
  idle_timeout: 20, // seconds
});

const db = drizzle(client, { schema });

// Prevent multiple pools in dev (hot reload safe)
declare global {
  // eslint-disable-next-line no-var
  var _db: typeof db | undefined;
}

const dbInstance = global._db ?? db;
if (process.env.NODE_ENV !== "production") {
  global._db = dbInstance;
}

export default dbInstance;


// just cuz it's bugging me with this error
// PostgresError: (EMAXCONNSESSION) max clients reached in session mode - max clients are limited to pool_size: 15
// ✅ Ensure only one pool in dev (hot reload safe)
