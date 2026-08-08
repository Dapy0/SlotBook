
import{ type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';

export async function authRoutes(fastify: FastifyInstance, option: Object) {

  fastify.get('/register', async function (request: FastifyRequest, response:FastifyReply){
    return 'Register Route'
  });

  fastify.get('/login', async function (request: FastifyRequest, response: FastifyReply) {
    return 'Login Route';
  });
}
