import "dotenv/config";
import cors from "@fastify/cors";
import Fastify from "fastify";
import { authRoutes } from "./modules/auth/auth.routes.ts";
import fastifyEnv from "@fastify/env";
import cookie from "@fastify/cookie";
import {
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import drizzlePlugin from "./db/drizzlePlugin.ts";
import fastifyJwt from "@fastify/jwt";
import jwtVerification from "./plugins/jwtVerification.ts";
import storagePlugin from "./plugins/storage";
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
import bookingExpiry from "./plugins/bookingExpiry";
import { staffMeRoutes } from "./modules/staff/staffMe.routes";
import {
  scheduleRequestMeRoutes,
  scheduleRequestRoutes,
} from "./modules/scheduleRequest/scheduleRequest.routes";
import fastifyMultipart from "@fastify/multipart";
import { FACILITY_IMAGE_MAX_BYTES } from "../../../packages/shared/src/facilityImage";
import type { FileStorage } from "./lib/storage/FileStorage";
import { facilityImageRoutes } from "./modules/facilityImage/facilityImage.routes";
import { loggerOptions, requestIdOptions } from "./lib/logger";
import * as Sentry from "@sentry/node";
import { healthRoutes } from "./modules/health";
export async function createServer(opts: { storage?: FileStorage } = {}) {
  const app = Fastify({
    logger: loggerOptions,
    trustProxy: true,
    ...requestIdOptions,
  }).withTypeProvider<ZodTypeProvider>();

  // validator and serializer
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  //Error handler
  app.setErrorHandler<Error>(function (error, request, reply) {
    if (hasZodFastifySchemaValidationErrors(error)) {
      request.log.info({ details: error.validation }, "Validation error");
      return reply.status(400).send({
        code: "BAD_REQUEST",
        message: "Validation Error.",
        details: error.validation,
      });
    }

    if (error instanceof AppError && error.statusCode < 500) {
      request.log.info({ code: error.code }, error.message);
      return reply
        .status(error.statusCode)
        .send({ code: error.code, message: error.message, details: error.details });
    }

    const status = (error as { statusCode?: number }).statusCode;
    if (status && status >= 400 && status < 500) {
      request.log.info({ statusCode: status }, error.message);
      return reply.status(status).send({ code: status ?? "BAD_REQUEST", message: error.message });
    }
    if (isResponseSerializationError(error)) {
      request.log.error({ err: error, issues: error.cause.issues }, "Response contract violated");
    } else {
      request.log.error({ err: error }, "Unhandled error");
    }
    Sentry.withScope((scope) => {
      scope.setTag("requestId", request.id);
      scope.setContext("request", { method: request.method, url: request.url });
      if (request.user?.id) scope.setUser({ id: request.user.id });
      Sentry.captureException(error);
    });
    return reply.status(500).send({
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
      requestId: request.id,
    });
  });

  // Plugins
  await app.register(fastifyEtag);
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: FACILITY_IMAGE_MAX_BYTES,
      files: 1,
      fields: 0,
    },
  });

  await app.register(fastifyCaching, {
    privacy: fastifyCaching.privacy.NOCACHE,
  });
  await app.register(cors, fastifyCorsOptions);
  await app.register(fastifyEnv, fastifyEnvOptions);
  await app.register(cookie, fastifyCookieOptions);
  await app.register(fastifyJwt, fastifyJwtOptions);
  await app.register(drizzlePlugin);
  await app.register(jwtVerification);
  await app.register(storagePlugin, { storage: opts.storage });
  await app.register(bookingExpiry);
  // routes
  await app.register(healthRoutes);
  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(facilityRoutes, { prefix: "/facilities" });
  await app.register(serviceRoutes, { prefix: "/facilities" });
  await app.register(staffMeRoutes, { prefix: "/staff" });
  await app.register(mineBookingsRoutes, { prefix: "/bookings" });
  await app.register(scheduleRequestRoutes, { prefix: "/facilities" });
  await app.register(scheduleRequestMeRoutes, { prefix: "/staff/me/schedule-requests" });
  await app.register(facilityImageRoutes, { prefix: "/facilities" });
  await app.register(geoRoutes);

  return app;
}
