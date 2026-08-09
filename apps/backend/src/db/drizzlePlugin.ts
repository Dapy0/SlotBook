import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { users, pgRoleEnums } from './schema.ts';
import { relations } from './relations.ts';

declare module 'fastify' {
  interface FastifyInstance {
    drizzle: NodePgDatabase<typeof relations>;
  }
}

function drizzlePlugin(fastify: FastifyInstance, options = {}, done: any) {
  if (!fastify.drizzle) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL!,
      ssl: true,
    });
    const db = drizzle({ client: pool, relations });
    fastify.decorate('drizzle', db);
    fastify.addHook('onClose', (fastify, done) => {
      pool
        .end()
        .then(() => done())
        .catch(done);
    });
  }
  done();
}

export default fp(drizzlePlugin, { name: 'fastify-drizzle' });
