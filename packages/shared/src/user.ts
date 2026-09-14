import * as z from "zod";
import { isoDateSchema } from './codecs';

export const userSchema = z.strictObject({
  id: z.uuid(),
  name: z.string().trim(),
  email: z.email(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
  deletedAt: isoDateSchema,
});

export type UserResponse = z.infer<typeof userSchema>;
