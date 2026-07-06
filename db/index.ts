import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';

const client = postgres(process.env.DATABASE_URL!);

// Create drizzle instance
const dbInstance = drizzle(client, { schema });

// just cuz it's bugging me with this error
// PostgresError: (EMAXCONNSESSION) max clients reached in session mode - max clients are limited to pool_size: 15
// ✅ Ensure only one pool in dev (hot reload safe)
declare global {
  // allow global.db to exist
  // eslint-disable-next-line no-var
  var _db: typeof dbInstance | undefined;
}

export const db = global._db ?? dbInstance;
if (process.env.NODE_ENV !== "production") {
  global._db = dbInstance;
}
