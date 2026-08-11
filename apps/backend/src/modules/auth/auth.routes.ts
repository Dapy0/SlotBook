import { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import { getAuthMe, postAuthLogout, postAuthRegister, postAuthSignIn } from './handler.ts';

import { authResponseSchema, loginSchema, registerSchema } from '@slotbook/shared/auth';


export async function authRoutes(fastify: FastifyInstance) {

  fastify.post(
    '/register',
    {
      schema: {
        body: registerSchema,
        response: {
          201: authResponseSchema,
        },
      },
    },
    postAuthRegister,
  );

  fastify.post(
    '/login',
    {
      schema: {
        body: loginSchema,
        response: {
          200: authResponseSchema,
        },
      },
    },
    postAuthSignIn,
  );
  fastify.get('/me', { onRequest: [fastify.authenticate] }, getAuthMe);
  fastify.get('/logout', postAuthLogout);
}
