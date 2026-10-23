import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import type { TestProject } from "vitest/node";

declare module "vitest" {
  export interface ProvidedContext {
    databaseUrl: string;
  }
}
export default async function setup(project: TestProject) {
  const container = await new PostgreSqlContainer("postgres:16-alpine").start();
  const url = container.getConnectionUri();

  const pool = new Pool({ connectionString: url });
  await migrate(drizzle({ client: pool }), { migrationsFolder: "./drizzle" });
  await pool.end();

  project.provide("databaseUrl", url);

  return async () => {
    await container.stop();
  };
}
