import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

function jwtVerification(fastify: FastifyInstance, options = {}, done: any) {
  fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify({ onlyCookie: true });
    } catch (err) {
      request.log.error(err);

      return reply.code(401).send({
        message: 'Unauthorized',
        details: (err as Error).message,
      });
    }
  });

  done();
}

export default fp(jwtVerification, { name: 'jwtVerification' });
