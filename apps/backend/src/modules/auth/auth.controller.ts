import {  type FastifyReply, type FastifyRequest } from 'fastify';
import {
  type LoginRequest,
  type RegisterRequest,
} from '@slotbook/shared/auth';
import { authorizeUser, signInUser, signUpUser } from './auth.service.ts';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function setAuthCookie(response: FastifyReply, token: string) {
  response.setCookie('token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
    signed: false,
  });
}

export const postAuthRegister = async (
  request: FastifyRequest<{ Body: RegisterRequest }>,
  response: FastifyReply,
) => {
  const { token, userObject } = await signUpUser(
    request.server.drizzle,
    request.server.jwt,
    request.body,
  );
  setAuthCookie(response, token);
  return response.code(201).send(userObject);
};
export const postAuthLogin = async (
  request: FastifyRequest<{ Body: LoginRequest }>,
  response: FastifyReply,
) => {
  const { token, userObject } = await signInUser(
    request.server.drizzle,
    request.server.jwt,
    request.body,
  );
  setAuthCookie(response, token);
  return response.send(userObject);
};
export const getAuthMe = async (request: FastifyRequest, response: FastifyReply) => {
  const {userObject} = await authorizeUser(request.server.drizzle, request.user.id);
  response.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  return response.send(userObject);
};
export const postAuthLogout = async (_request: FastifyRequest, response: FastifyReply) => {
  response.clearCookie('token', { path: '/' });
  return response.send({ message: 'Logged out' });
};
