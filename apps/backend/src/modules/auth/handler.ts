import type { FastifyReply, FastifyRequest } from 'fastify';
import type { registerUserSchema } from '../../db/schema.ts';
import type z from 'zod';
import { registerUser } from './db.ts';

type RegisterBody = z.infer<typeof registerUserSchema>;

export const postAuthRegister = async (
  request: FastifyRequest<{ Body: RegisterBody }>,
  response: FastifyReply,
) => {
  const { email, name, passwordHash, role } = request.body;

  const result = registerUser(request.server.drizzle);
};
