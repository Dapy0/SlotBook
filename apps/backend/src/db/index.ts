import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL!,
//   ssl: true,
// });
// export const db = drizzle({ client: pool });

// export const checkDBConnection = async () => {
//   return await db.execute('select 1');
// };
