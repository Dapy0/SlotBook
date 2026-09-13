import { type FastifyReply, type FastifyRequest } from "fastify";
import { type LoginRequest, type RegisterRequest } from "@slotbook/shared/auth";
import { authorizeUser, deleteUserById, signInUser, signUpUser } from "./auth.service.ts";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function setAuthCookie(response: FastifyReply, token: string) {
  response.setCookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    signed: false,
  });
}

export const postAuthRegister = async (
  request: FastifyRequest<{ Body: RegisterRequest }>,
  response: FastifyReply,
) => {
  const { token, user } = await signUpUser(
    request.server.drizzle,
    request.server.jwt,
    request.body,
  );
  setAuthCookie(response, token);
  return response.code(201).send({ user: user });
};
export const postAuthLogin = async (
  request: FastifyRequest<{ Body: LoginRequest }>,
  response: FastifyReply,
) => {
  const { token, user } = await signInUser(
    request.server.drizzle,
    request.server.jwt,
    request.body,
  );
  setAuthCookie(response, token);
  return response.send({ user: user });
};
export const getAuthMe = async (request: FastifyRequest, response: FastifyReply) => {
  const { user } = await authorizeUser(request.server.drizzle, request.user.id);
  response.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  return response.send({ user: user });
};
export const postAuthLogout = async (request: FastifyRequest, response: FastifyReply) => {
  response.clearCookie("token", { path: "/" });
  return response.send({ message: "Logged out" });
};

export async function deleteUserAccount(request: FastifyRequest, response: FastifyReply) {
  await deleteUserById(request.server.drizzle, request.user.id);
  return response.send(204);
}
