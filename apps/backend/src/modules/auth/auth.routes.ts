import { type FastifyInstance } from "fastify";
import {
  getAuthMe,
  postAuthLogout,
  postAuthRegister,
  postAuthLogin,
  deleteUserAccount,
} from "./auth.controller.ts";

import { authResponseSchema, loginSchema, registerSchema } from "@slotbook/shared/auth";

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/register",
    {
      schema: {
        body: registerSchema,
        response: {
          201: authResponseSchema,
        },
      },
    },
    postAuthRegister,
  );

  fastify.post(
    "/login",
    {
      schema: {
        body: loginSchema,
        response: {
          200: authResponseSchema,
        },
      },
    },
    postAuthLogin,
  );
  fastify.get(
    "/me",
    {
      onRequest: [fastify.authenticate],
      schema: {
        response: {
          200: authResponseSchema,
        },
      },
    },
    getAuthMe,
  );
  fastify.delete(
    "/me",
    {
      onRequest: [fastify.authenticate],
      schema: {
        response: {},
      },
    },
    deleteUserAccount,
  );
  fastify.get("/logout", postAuthLogout);
}
