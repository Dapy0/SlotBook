import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from 'path';
import { Pool } from "pg";
import { fileURLToPath } from 'url';
import type { TestProject } from "vitest/node";

declare module "vitest" {
  export interface ProvidedContext {
    databaseUrl: string;
  }
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default async function setup(project: TestProject) {
  const container = await new PostgreSqlContainer("postgres:16-alpine").start();
  const url = container.getConnectionUri();

  const pool = new Pool({ connectionString: url });
  const migrationsPath = path.resolve(__dirname, "../../drizzle");
  await migrate(drizzle({ client: pool }), { migrationsFolder: migrationsPath });
  await pool.end();

  project.provide("databaseUrl", url);

  return async () => {
    await container.stop();
  };
}
