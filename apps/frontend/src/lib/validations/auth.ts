import { registerSchema } from '@slotbook/shared/auth';
import { z } from 'zod';

export const loginSchema = registerSchema.omit({
  name: true,
});

export const signUpSchema = registerSchema
  .extend({
    confirmPassword: z.string().min(8, 'Minimum 8 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    error: 'Passwords do not match',
  });
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof signUpSchema>;
