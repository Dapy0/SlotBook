import "dotenv/config";
import cors from "@fastify/cors";
import Fastify from "fastify";
import { authRoutes } from "./modules/auth/auth.routes.ts";
import fastifyEnv from "@fastify/env";
import cookie from "@fastify/cookie";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import drizzlePlugin from "./db/drizzlePlugin.ts";
import fastifyJwt from "@fastify/jwt";
import jwtVerification from "./plugins/jwtVerification.ts";
import { facilityRoutes } from "./modules/facility/facility.routes.ts";
import { serviceRoutes } from "./modules/service/service.routes.ts";
import {
  fastifyCookieOptions,
  fastifyCorsOptions,
  fastifyEnvOptions,
  fastifyJwtOptions,
} from "./app.config.ts";
import fastifyEtag from "@fastify/etag";
import fastifyCaching from "@fastify/caching";
import { AppError } from "./lib/errors.ts";
import { mineBookingsRoutes } from "./modules/booking/booking.routes.ts";
import { geoRoutes } from "./modules/geoLocation.ts";
import { ZodError } from "zod";
const isDev = process.env.NODE_ENV !== "production";
export async function createServer() {
  const app = Fastify({
    logger: isDev
      ? {
          level: "debug",
          transport: {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "HH:MM:ss Z",
              ignore: "pid,hostname",
            },
          },
        }
      : {
          level: "info",
        },
  }).withTypeProvider<ZodTypeProvider>();

  // validator and serializer
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  //Error handler
  app.setErrorHandler<Error>(function (error, request, reply) {
    request.log.error(error);
    if (error instanceof ZodError) {
      return reply.status(400).send({
        code: "BAD_REQUEST",
        message: "Data validation Error.",
        issues: error.issues,
      });
    }
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({ code: error.code, message: error.message });
    }
    return reply.status(500).send({ message: "Internal server error" });
  });

  // Plugins
  await app.register(fastifyEtag);
  await app.register(fastifyCaching, {
    privacy: fastifyCaching.privacy.NOCACHE,
  });
  await app.register(cors, fastifyCorsOptions);
  await app.register(fastifyEnv, fastifyEnvOptions);
  await app.register(cookie, fastifyCookieOptions);
  await app.register(fastifyJwt, fastifyJwtOptions);
  await app.register(drizzlePlugin);
  await app.register(jwtVerification);
  // await app.register(geoLocation);
  // routes
  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(facilityRoutes, { prefix: "/facilities" });
  await app.register(serviceRoutes, { prefix: "/facilities" });
  await app.register(mineBookingsRoutes, { prefix: "/bookings" });
  await app.register(geoRoutes);

  return app;
}
