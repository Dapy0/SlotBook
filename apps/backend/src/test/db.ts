import { sql } from "drizzle-orm";
import type { DB } from "../db/drizzlePlugin";

export async function resetDb(db: DB) {
  const res = await db.execute<{ tablename: string }>(
    sql`select tablename from pg_tables where schemaname = 'public'`,
  );
  if (res.rows.length === 0) return;
  const list = res.rows.map((r) => `"${r.tablename}"`).join(", ");
  await db.execute(sql.raw(`TRUNCATE ${list} RESTART IDENTITY CASCADE`));
}
