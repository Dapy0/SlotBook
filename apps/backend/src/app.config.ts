import fastifyCaching from "@fastify/caching";
import type { FastifyCookieOptions } from "@fastify/cookie";
import type { FastifyCorsOptions } from "@fastify/cors";
import { type FastifyEnvOptions } from "@fastify/env";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envSchema = {
  type: "object",
  required: ["PORT", "DATABASE_URL", "JWT_SECRET_KEY", "APP_HOST"],
  properties: {
    PORT: {
      type: "number",
    },
    DATABASE_URL: {
      type: "string",
    },
    JWT_SECRET_KEY: {
      type: "string",
    },
    APP_HOST: {
      type: "string",
    },
  },
};
// Must stay in sync with envSchema above (fastify-env validates it at startup).
export type EnvType = {
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET_KEY: string;
  APP_HOST: string;
};

export const fastifyEnvOptions: FastifyEnvOptions = {
  confKey: "config",
  schema: envSchema,
  dotenv: {
    path: path.join(__dirname, "../.env"),
  },
};

// cors options

export const fastifyCorsOptions: FastifyCorsOptions = {
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  methods: "GET,PUT,POST,PATCH,DELETE",
  credentials: true,
};

// cookie
export const fastifyCookieOptions: FastifyCookieOptions = {
  secret: process.env.JWT_SECRET_KEY!,
};

// JWT

export const fastifyJwtOptions = {
  secret: process.env.JWT_SECRET_KEY!,
  cookie: {
    cookieName: "token",
    signed: false,
  },
};
// Caching
export const fastifyCachingOptions = {
  privacy: fastifyCaching.privacy.NOCACHE,
};
