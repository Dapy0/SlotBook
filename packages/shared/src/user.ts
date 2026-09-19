import * as z from "zod";
import { instantSchema } from "./codecs";

function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone });
    return true;
  } catch {
    return false;
  }
}
export const timezoneSchema = z
  .string()
  .trim()
  .refine(isValidTimeZone, { error: "Incorrect IANA" });


export const userSchema = z.strictObject({
  id: z.uuid(),
  name: z.string().trim(),
  email: z.email(),
  timezone: timezoneSchema,
  createdAt: instantSchema,
  updatedAt: instantSchema,
  deletedAt: instantSchema.nullable(),
});

export type UserResponse = z.infer<typeof userSchema>;
