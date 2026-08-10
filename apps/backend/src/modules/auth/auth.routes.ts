import { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import { postAuthRegister, postAuthSignIn } from './handler.ts';
import { authResponseSchema, registerUserSchema, selectUserSchema, signInUserSchema } from './auth.schema.ts';


export async function authRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/register',
    {
      schema: {
        body: registerUserSchema,
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
        body: signInUserSchema,
        response: {
          201: authResponseSchema,
        },
      },
    },
    postAuthSignIn,
  );
}
