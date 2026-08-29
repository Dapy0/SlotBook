import { registerSchema } from '@slotbook/shared/auth';
import { z } from 'zod';

export const loginSchema = registerSchema.omit({
  name: true,
});

export const signUpSchema = registerSchema
  .extend({
    confirmPassword: z.string().min(1, 'Repeat your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword', 'password'],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof signUpSchema>;
