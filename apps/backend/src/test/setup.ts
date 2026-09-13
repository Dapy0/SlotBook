import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

let container: StartedPostgreSqlContainer;

export async function startTestDatabase() {
  container = await new PostgreSqlContainer("postgres:16-alpine").start();
  const connectionUri = container.getConnectionUri();

  process.env.DATABASE_URL = connectionUri;
  process.env.JWT_SECRET_KEY = "test-secret-key";
  process.env.PORT = "0";

  const pool = new Pool({ connectionString: connectionUri });
  const db = drizzle({ client: pool });
  await migrate(db, { migrationsFolder: "./drizzle" });
  await pool.end();
}

export async function stopTestDatabase() {
  await container?.stop();
}
