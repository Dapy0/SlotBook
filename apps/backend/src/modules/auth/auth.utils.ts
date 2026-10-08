import type { FastifyReply } from "fastify";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function setAuthCookie(response: FastifyReply, token: string) {
  response.setCookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    signed: false,
  });
}
