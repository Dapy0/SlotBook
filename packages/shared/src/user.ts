import z from 'zod';
export const USER_ROLES = ['CLIENT', 'OWNER', 'ADMIN'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const userSchema = z.strictObject({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  role: z.enum(USER_ROLES),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserResponse = z.infer<typeof userSchema>;
