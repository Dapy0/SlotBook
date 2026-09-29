import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { findUserById } from "../modules/auth/auth.repository";
import { UnauthorizedError } from "../lib/errors";

function jwtVerification(fastify: FastifyInstance, _options = {}, done: () => void) {
  if (!fastify.authenticate) {
    async function auth(request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify({ onlyCookie: true });

        const user = await findUserById(request.server.drizzle, request.user.id);
        if (user == null || user.deletedAt !== null) {
          throw new UnauthorizedError();
        }
      } catch (err) {
        request.log.error(err);
        reply.clearCookie("token", { path: "/" });
        return reply.status(401).send({ message: "Unauthorized: Session invalid or expired" });
      }
    }
    fastify.decorate("authenticate", auth);
  }

  done();
}

export default fp(jwtVerification, { name: "jwtVerification" });
