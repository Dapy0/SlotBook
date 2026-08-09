import Fastify from 'fastify';
import { authRoutes } from './modules/auth/auth.routes.js';
import fastifyEnv, { type FastifyEnvOptions } from '@fastify/env';
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';
import drizzlePlugin from './db/drizzlePlugin.ts';

const schema = {
  type: 'object',
  required: ['PORT', 'DATABASE_URL'],
  properties: {
    PORT: {
      type: 'number',
    },
    DATABASE_URL: {
        type: 'string'
    },
  },
};
const options: FastifyEnvOptions = {
  confKey: 'config',
  schema: schema,
  dotenv: true
};

declare module 'fastify' {
  interface FastifyInstance {
    config: {
      PORT: number;
      DATABASE_URL: string;
    };
  }
}



export function createServer() {
  const app = Fastify({
    logger: true,
  }).withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.register(fastifyEnv, options).after((err) => {
    if (err) console.error(err);
    console.log(app.getEnvs());
  });
  app.register(drizzlePlugin);

  app.get('/health', async (req, res) => res.send('All is ok'));

  app.register(authRoutes, { prefix: '/auth' });

  return app;
}
