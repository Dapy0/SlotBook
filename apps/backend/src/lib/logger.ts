import { randomUUID } from "crypto";
import type { FastifyServerOptions } from "fastify";

const isProd = process.env.NODE_ENV === "production";

export const loggerOptions: NonNullable<FastifyServerOptions["logger"]> = {
  level: process.env.LOG_LEVEL ?? (isProd ? "info" : "debug"),
  redact: {
    paths: [
      "req.headers.cookie",
      "req.headers.authorization",
      'res.headers["set-cookie"]',
      "*.password",
      "*.passwordHash",
    ],
    censor: "[REDACTED]",
  },
  ...(isProd
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "HH:MM:ss Z", ignore: "pid,hostname" },
        },
      }),
};
export const requestIdOptions = {
  requestIdHeader: "x-request-id",
  genReqId: () => randomUUID(),
};
