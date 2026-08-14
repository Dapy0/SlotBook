import { fastify, type FastifyReply, type FastifyRequest } from 'fastify';
import bcrypt from 'bcrypt';
import { findUserByEmail, findUserById, registerUser } from './auth.repository.ts';
import {
  authResponseSchema,
  type AuthResponse,
  type LoginRequest,
  type RegisterRequest,
} from '@slotbook/shared/auth';
import type { UserResponse } from '@slotbook/shared/user';

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
  const passwordHash = await bcrypt.hash(request.body.password, 10);

  const user = await registerUser(request.server.drizzle, {
    email: request.body.email,
    name: request.body.name,
    passwordHash,
    role: 'CLIENT',
  }).catch((err) => console.log('Failed to Create User'));
  if (!user) {
    return response.code(400).send({ message: 'Failed to create user' });
  }
  const token = request.server.jwt.sign({ id: user.id, role: user.role });
  const { passwordHash: _, name, createdAt, email, id, role, updatedAt } = user;
  setAuthCookie(response, token);
  const responseData: AuthResponse = {
    user: {
      name,
      createdAt,
      email,
      id,
      role,
      updatedAt,
    },
  };

  return response.code(201).send(responseData);
};
export const postAuthSignIn = async (
  request: FastifyRequest<{ Body: LoginRequest }>,
  response: FastifyReply,
) => {
  const { email: typedEmail, password } = request.body;

  try {
    const user = await findUserByEmail(request.server.drizzle, typedEmail).catch((err) =>
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
    const { passwordHash: _, name, createdAt, email, id, role, updatedAt } = user;

    setAuthCookie(response, token);

    const responseData: AuthResponse = {
      user: {
        name,
        createdAt,
        email,
        id,
        role,
        updatedAt,
      },
    };
    return response.code(200).send(responseData);
  } catch (e) {
    throw e;
  }
};
export const getAuthMe = async (request: FastifyRequest, response: FastifyReply) => {
  const user = await findUserById(request.server.drizzle, request.user.id);

  if (!user) {
    return response.code(404).send({ message: 'User not found' });
  }

  const { passwordHash: _, name, createdAt, email, id, role, updatedAt } = user;
  const responseData: AuthResponse = {
    user: {
      name,
      createdAt,
      email,
      id,
      role,
      updatedAt,
    },
  };
  return response.code(200).send(responseData);
};
export const postAuthLogout = async (_request: FastifyRequest, response: FastifyReply) => {
  response.clearCookie('token', { path: '/' });
  return response.status(200).send({ message: 'Logged out' });
};
