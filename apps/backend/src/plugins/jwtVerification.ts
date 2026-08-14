import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

function jwtVerification(fastify: FastifyInstance, options = {}, done: any) {
  if (!fastify.authenticate) {
    async function auth(request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify({ onlyCookie: true });
      } catch (err) {
        request.log.error(err);
        return reply.status(401).send({ message: 'Unauthorized: Session invalid or expired' });
      }
    }
    fastify.decorate('authenticate', auth);
  }

  done();
}

export default fp(jwtVerification, { name: 'jwtVerification' });
