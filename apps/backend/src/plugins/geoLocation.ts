import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import geoip from 'geoip-lite';

const COOKIE_NAME = '_sb_country';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

async function detectCountry(request: FastifyRequest, reply: FastifyReply) {
  if (request.cookies[COOKIE_NAME]) return;

  const ip = request.ip.replace('::ffff:', '');
  const geo = geoip.lookup(ip);
  const country = geo?.country ?? 'PL';

  reply.setCookie(COOKIE_NAME, country, {
    httpOnly: false,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
    signed: false,
  });
}

function geoLocation(fastify: FastifyInstance, options = {}, done: any) {
  fastify.addHook('onRequest', detectCountry);
  done();
}

export default fp(geoLocation, { name: 'geoLocation' });
