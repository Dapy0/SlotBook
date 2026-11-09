import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { relations } from "./relations.ts";
import { sslFromUrl } from "./sslConfig";

export type DB = NodePgDatabase<typeof relations>;

function drizzlePlugin(fastify: FastifyInstance, _options: object, done: (err?: Error) => void) {
  if (!fastify.drizzle) {
    const connectionString = process.env.DATABASE_URL!;
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL!,
      ssl: sslFromUrl(connectionString),
    });
    const db = drizzle({ client: pool, relations });
    fastify.decorate("drizzle", db);
    fastify.addHook("onClose", (fastify, done) => {
      pool
        .end()
        .then(() => done())
        .catch(done);
    });
  }
  done();
}

export default fp(drizzlePlugin, { name: "fastify-drizzle" });
