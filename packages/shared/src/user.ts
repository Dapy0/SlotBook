import z from 'zod';
export const USER_ROLES = ['CLIENT', 'OWNER', 'ADMIN'] as const;
export type UserRole = (typeof USER_ROLES)[number];

const isoDateSchema = z
  .union([z.date(), z.string()])
  .transform((val) => (val instanceof Date ? val.toISOString() : val));

export const userSchema = z.strictObject({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  role: z.enum(USER_ROLES),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type UserResponse = z.infer<typeof userSchema>;
