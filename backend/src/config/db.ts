import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Pool = a group of reusable database connections.
// Instead of opening/closing a connection for every query (slow),
// the pool keeps N connections open and lends them out on demand.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Neon (and most cloud Postgres)
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL connected');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err);
  process.exit(-1);
});
