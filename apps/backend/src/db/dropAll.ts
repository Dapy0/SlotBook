import "dotenv/config";
import { Pool } from "pg";
import { sslFromUrl } from './sslConfig';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: sslFromUrl(process.env.DATABASE_URL!),
});

await pool.query(`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`);
await pool.query(`DROP SCHEMA IF EXISTS migration CASCADE;`);
await pool.query(`DROP SCHEMA IF EXISTS drizzle CASCADE;`);
await pool.end();
