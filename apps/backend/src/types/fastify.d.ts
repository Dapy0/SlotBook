import { FastifyInstance } from "fastify";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import "@fastify/jwt";
import type { DB } from "../db/drizzlePlugin.ts";
import type { EnvType } from "../app.config.ts";
declare module "fastify" {
  interface FastifyInstance {
    config: EnvType;
    drizzle: DB;
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { id: string };
    user: { id: string };
  }
}
