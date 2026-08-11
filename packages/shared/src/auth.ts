import { userSchema } from './user.ts';
import z from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.email(),
  password: z.string().min(8),
});
export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});
export const authResponseSchema = z.strictObject({
  user: userSchema,
});

export type RegisterRequest = z.infer<typeof registerSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
