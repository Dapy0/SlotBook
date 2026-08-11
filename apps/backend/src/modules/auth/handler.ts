import { fastify, type FastifyReply, type FastifyRequest } from 'fastify';
import bcrypt from 'bcrypt';
import type z from 'zod';
import { findUserByEmail, findUserById, registerUser } from './db.ts';
import type { registerUserSchema, signInUserSchema } from './auth.schema.ts';
import { roleEnums, users } from '../../db/schema.ts';

type RegisterBody = z.infer<typeof registerUserSchema>;
type SignInBody = z.infer<typeof signInUserSchema>;

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function setAuthCookie(response: FastifyReply, token: string) {
  response.setCookie('token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
    signed: false
  });
}

export const postAuthRegister = async (
  request: FastifyRequest<{ Body: RegisterBody }>,
  response: FastifyReply,
) => {
  const { email, name, password } = request.body;

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await registerUser(request.server.drizzle, {
    email,
    name,
    passwordHash,
    role: 'CLIENT',
  }).catch((err) => console.log('Failed to Create User'));
  if (!user) {
    return response.code(400).send({ message: 'Failed to create user' });
  }
  const token = request.server.jwt.sign({ id: user.id, role: user.role });
  const { passwordHash: _, ...userWithoutPassword } = user;

  setAuthCookie(response, token);

  return response.status(200).send({
    ...userWithoutPassword,
  });
};
export const postAuthSignIn = async (
  request: FastifyRequest<{ Body: SignInBody }>,
  response: FastifyReply,
) => {
  const { email, password } = request.body;

  try {
    const user = await findUserByEmail(request.server.drizzle, email).catch((err) =>
      console.log('Failed to Find User'),
    );

    if (!user) {
      console.log('No user found');
      return response.code(400).send({ message: 'No user found' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return response.status(401).send({ message: 'Incorrect Password' });
    }

    const token = request.server.jwt.sign({ id: user.id, role: user.role });
    const { passwordHash: _, ...userWithoutPassword } = user;

    setAuthCookie(response, token);

    return response.status(200).send({
      ...userWithoutPassword,
    });
  } catch (e) {
    throw e;
  }
};
export const getAuthMe = async (request: FastifyRequest, response: FastifyReply) => {
  const user = await findUserById(request.server.drizzle, request.user.id);

  if (!user) {
    return response.code(404).send({ message: 'User not found' });
  }

  const { passwordHash: _, ...safeUser } = user;
  return response.status(200).send(safeUser);
};
export const postAuthLogout = async (_request: FastifyRequest, response: FastifyReply) => {
  response.clearCookie('token', { path: '/' });
  return response.status(200).send({ message: 'Logged out' });
};
