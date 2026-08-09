import { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import { postAuthRegister } from './handler.ts';
import { registerUserSchema, selectUserSchema } from '../../db/schema.ts';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/register',
    {
      schema: {
        body: registerUserSchema,
        response: {
          201: selectUserSchema.omit({ passwordHash: true }),
        },
      },
    },
    postAuthRegister,
  );

  fastify.get('/login', async function (request: FastifyRequest, response: FastifyReply) {
    return 'Login Route';
  });
}
