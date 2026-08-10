import type { FastifyInstance } from 'fastify';

export async function bookingRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/', async (request) => {
    console.log('test');
  });
}
