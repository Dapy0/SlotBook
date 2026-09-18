import * as z from "zod";
import { instantSchema } from "./codecs";

export const userSchema = z.strictObject({
  id: z.uuid(),
  name: z.string().trim(),
  email: z.email(),
  createdAt: instantSchema,
  updatedAt: instantSchema,
  deletedAt: instantSchema.nullable(),
});

export type UserResponse = z.infer<typeof userSchema>;
