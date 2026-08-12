import 'dotenv/config';
import cors from '@fastify/cors';
import Fastify, { fastify, type FastifyReply } from 'fastify';
import { authRoutes } from './modules/auth/auth.routes.ts';
import fastifyEnv, { type FastifyEnvOptions } from '@fastify/env';
import cookie from '@fastify/cookie';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import drizzlePlugin from './db/drizzlePlugin.ts';
import fastifyJwt from '@fastify/jwt';
import path from 'path';
import { fileURLToPath } from 'url';
import jwtVerification from './plugins/jwtVerification.ts';
import { bookingRoutes } from './modules/booking/booking.routes.ts';
import { facilityRoutes } from './modules/facility/facility.routes.ts';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schema = {
  type: 'object',
  required: ['PORT', 'DATABASE_URL', 'JWT_SECRET_KEY'],
  properties: {
    PORT: {
      type: 'number',
    },
    DATABASE_URL: {
      type: 'string',
    },
    JWT_SECRET_KEY: {
      type: 'string',
    },
  },
};
const options: FastifyEnvOptions = {
  confKey: 'config',
  schema: schema,
  dotenv: {
    path: path.join(__dirname, '../.env'),
  },
};

export async function createServer() {
  const app = Fastify({
    logger: true,
  }).withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.setErrorHandler(function (error: any, request, reply) {
    request.log.error(error);
    if (error.validation) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Ошибка валидации данных. Проверьте правильность полей.',
        details: error.validation,
      });
    }

    return reply.status(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'На сервере произошла непредвиденная ошибка. Мы уже чиним!',
    });
  });

  await app.register(cors, {
    origin: 'http://localhost:3000',
    credentials: true,
  });
  await app.register(fastifyEnv, options);
  await app.register(drizzlePlugin);
  await app.register(cookie, {
    secret: app.config.JWT_SECRET_KEY,
  });
  await app.register(fastifyJwt, {
    secret: app.config.JWT_SECRET_KEY ?? process.env.JWT_SECRET_KEY,
    cookie: {
      cookieName: 'token',
      signed: false,
    },
  });
  await app.register(jwtVerification);
  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(facilityRoutes, { prefix: '/facilities' });
  // await app.register(bookingRoutes, { prefix: '/booking' });

  app.get('/health', async (req, res) => res.send('All is ok'));

  return app;
}
