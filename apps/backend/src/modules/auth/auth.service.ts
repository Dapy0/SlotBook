/* eslint-disable @typescript-eslint/no-unused-vars */
import type { DB } from "../../db/drizzlePlugin.ts";
import bcrypt from "bcrypt";
import {
  deleteUserById,
  findUserByEmail,
  findUserById,
  insertUserByUserData,
} from "./auth.repository.ts";
import { ConflictError, NotFoundError, UnauthorizedError } from "../../lib/errors.ts";
import type { FastifyInstance } from "fastify";
import type { AuthResponse, LoginRequest, RegisterRequest } from "@slotbook/shared";
import { getPgErrorCode, PG } from "../../lib/pgErrors";

type JWT = FastifyInstance["jwt"];
export async function signUpUser(
  db: DB,
  jwt: JWT,
  data: RegisterRequest,
): Promise<AuthResponse & { token: string }> {
  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await insertUserByUserData(db, {
    ...data,
    passwordHash,
  }).catch((e) => {
    if (getPgErrorCode(e) === PG.UNIQUE) {
      throw new ConflictError("Email already exists");
    }

    throw e;
  });

  const token = jwt.sign({ id: user.id });
  const { passwordHash: _, deletedAt: __, ...newUser } = user;

  return {
    user: newUser,
    token,
  };
}

export async function signInUser(
  db: DB,
  jwt: JWT,
  data: LoginRequest,
): Promise<AuthResponse & { token: string }> {
  const user = await findUserByEmail(db, data.email);

  if (!user) {
    throw new NotFoundError("User with this email not found");
  }
  const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new UnauthorizedError("Password is incorrect");
  }

  const token = jwt.sign({ id: user.id });
  const { passwordHash: _, deletedAt: __, ...newUser } = user;

  return {
    user: newUser,
    token,
  };
}
export async function authorizeUser(db: DB, userId: string): Promise<AuthResponse> {
  const user = await findUserById(db, userId);

  if (!user) {
    throw new NotFoundError("User Not Found");
  }

  const { passwordHash: _, deletedAt: __, ...newUser } = user;
  return {
    user: newUser,
  };
}
export async function deleteUser(db: DB, userId: string) {
  await deleteUserById(db, userId);
}
