import z from 'zod';

const isoDateSchema = z
  .union([z.date(), z.string()])
  .transform((val) => (val instanceof Date ? val.toISOString() : val));

export const userSchema = z.strictObject({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type UserResponse = z.infer<typeof userSchema>;
