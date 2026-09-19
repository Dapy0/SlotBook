import * as z from "zod";
import { instantSchema } from "./common/codecs";
import { timezoneSchema } from './common/primitives';

export const userResponseSchema = z.strictObject({
  id: z.uuid(),
  name: z.string().trim(),
  email: z.email(),
  timezone: timezoneSchema,
  createdAt: instantSchema,
  updatedAt: instantSchema,
  deletedAt: instantSchema.nullable(),
});

export type UserResponse = z.infer<typeof userResponseSchema>;
