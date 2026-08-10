import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { relations } from './relations.ts';

export type DB = NodePgDatabase<typeof relations>;


function drizzlePlugin(fastify: FastifyInstance, options = {}, done: any) {
  console.log('CHECK DATABASE_URL:', process.env.DATABASE_URL!);
  if (!fastify.drizzle) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL!,
      ssl: false,
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
