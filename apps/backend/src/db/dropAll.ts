import "dotenv/config";
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.DATABASE_URL!, ssl: false });

await pool.query(`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`);
await pool.query(`DROP SCHEMA IF EXISTS migration CASCADE;`);
await pool.query(`DROP SCHEMA IF EXISTS drizzle CASCADE;`);
await pool.end();
