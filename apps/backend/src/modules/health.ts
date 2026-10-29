import { sql } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const healthRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get("/health", { logLevel: "warn" }, async (request, reply) => {
    try {
      await request.server.drizzle.execute(sql`select 1`);
      return { status: "ok", uptime: Math.round(process.uptime()) };
    } catch (err) {
      request.log.error({ err }, "health: db unreachable");
      return reply.status(503).send({ status: "db_unreachable" });
    }
  });
};
