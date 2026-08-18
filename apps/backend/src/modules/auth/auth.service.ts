import type { AuthResponseDTO, LoginRequest, RegisterRequest } from '@slotbook/shared/auth';
import type { DB } from '../../db/drizzlePlugin.ts';
import bcrypt from 'bcrypt';
import { findUserByEmail, findUserById, registerUser } from './auth.repository.ts';
import { BadRequestError, ConflictError, NotFoundError } from '../../lib/errors.ts';
import type { FastifyInstance, FastifyReply } from 'fastify';

type JWT = FastifyInstance['jwt'];
export async function signUpUser(db: DB, jwt: JWT, data: RegisterRequest) {
  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await registerUser(db, {
    ...data,
    passwordHash,
  }).catch((e) => {
    if ((e as Error).message?.includes('unique')) {
      throw new ConflictError('Email already taken');
    }
    throw e;
  });

  const token = jwt.sign({ id: user.id });
  const { passwordHash: _, ...newUser } = user;

  return {
    userObject: { user: { ...newUser } },
    token,
  };
}

export async function signInUser(db: DB, jwt: JWT, data: LoginRequest) {
  const user = await findUserByEmail(db, data.email);

  if (!user) {
    throw new NotFoundError('User with this email not found');
  }
  const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new BadRequestError('Password is incorrect');
  }

  const token = jwt.sign({ id: user.id });
  const { passwordHash: _, ...newUser } = user;

  return {
    userObject: { user: { ...newUser } },
    token,
  };
}
export async function authorizeUser(db: DB, userId: string) {
  const user = await findUserById(db, userId);

  if (!user) {
    throw new NotFoundError('User Not Found');
  }

  const { passwordHash: _, ...newUser } = user;
  return {
    userObject: { user: { ...newUser } } as AuthResponseDTO,
  };
}
