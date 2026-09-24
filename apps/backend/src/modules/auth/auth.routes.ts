import { authResponseSchema, loginRequestSchema, registerRequestSchema } from "@slotbook/shared";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { authorizeUser, deleteUser, signInUser, signUpUser } from "./auth.service";
import { setAuthCookie } from "./auth.utils";

export const authRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post(
    "/register",
    {
      schema: {
        body: registerRequestSchema,
        response: {
          201: authResponseSchema,
        },
      },
    },
    async (request, response) => {
      const { token, user } = await signUpUser(
        request.server.drizzle,
        request.server.jwt,
        request.body,
      );
      setAuthCookie(response, token);
      return response.code(201).send({ user: user });
    },
  );

  fastify.post(
    "/login",
    {
      schema: {
        body: loginRequestSchema,
        response: {
          200: authResponseSchema,
        },
      },
    },
    async (request, response) => {
      const { token, user } = await signInUser(
        request.server.drizzle,
        request.server.jwt,
        request.body,
      );
      setAuthCookie(response, token);
      return response.send({ user: user });
    },
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
    async (request, response) => {
      const { user } = await authorizeUser(request.server.drizzle, request.user.id);
      response.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
      return response.send({ user: user });
    },
  );
  fastify.delete(
    "/me",
    {
      onRequest: [fastify.authenticate],
      schema: {
        response: {},
      },
    },
    async (request, response) => {
      await deleteUser(request.server.drizzle, request.user.id);
      return response.send(204).send();
    },
  );
  fastify.get("/logout", async (request, response) => {
    response.clearCookie("token", { path: "/" });
    return response.send({ message: "Logged out" });
  });
};
