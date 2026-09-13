import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import geoip from "geoip-lite";

const COOKIE_NAME = "_sb_country";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export async function detectCountry(request: FastifyRequest, response: FastifyReply) {
  if (request.cookies[COOKIE_NAME]) {
    return response.code(200).send({ country: request.cookies[COOKIE_NAME] });
  }

  const ip = request.ip.replace("::ffff:", "");
  const geo = geoip.lookup(ip);
  const country = geo?.country ?? "PL";

  response.setCookie(COOKIE_NAME, country, {
    httpOnly: false,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    signed: false,
  });

  return response.code(200).send({ country: country });
}
