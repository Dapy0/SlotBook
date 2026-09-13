import * as z from "zod";

// const isoDateSchema = z
//   .union([z.date(), z.string().trim()])
//   .transform((val) => (val instanceof Date ? val.toISOString() : val));

export const userSchema = z.strictObject({
  id: z.uuid(),
  name: z.string().trim(),
  email: z.email(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date(),
});

export type UserResponse = z.infer<typeof userSchema>;
