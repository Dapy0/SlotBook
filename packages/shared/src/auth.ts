import { userSchema } from './user';
import z from 'zod';

// Request DTOs
export const registerSchema = z.object({
  name: z.string().min(2, 'Minimum 2 characters').max(255, 'Name is too long'),
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'Minimum 8 characters'),
});
export const loginSchema = registerSchema.omit({ name: true });

export type RegisterRequest = z.infer<typeof registerSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;

// Response DTOs
export const authResponseSchema = z.strictObject({
  user: userSchema,
});
export type AuthResponseDTO = z.infer<typeof authResponseSchema>;
