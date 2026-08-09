import Fastify, { fastify } from 'fastify';
import { authRoutes } from './modules/auth/auth.routes.js';
import fastifyEnv, { type FastifyEnvOptions } from '@fastify/env';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import drizzlePlugin from './db/drizzlePlugin.ts';

const schema = {
  type: 'object',
  required: ['PORT', 'DATABASE_URL'],
  properties: {
    PORT: {
      type: 'number',
    },
    DATABASE_URL: {
      type: 'string',
    },
  },
};
const options: FastifyEnvOptions = {
  confKey: 'config',
  schema: schema,
  dotenv: true,
};

declare module 'fastify' {
  interface FastifyInstance {
    config: {
      PORT: number;
      DATABASE_URL: string;
    };
  }
}
export async function createServer() {
  const app = Fastify({
    logger: true,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(fastifyEnv, options);
  await app.register(drizzlePlugin);
  await app.register(authRoutes, { prefix: '/auth' });

  app.get('/health', async (req, res) => res.send('All is ok'));

  return app;
}
