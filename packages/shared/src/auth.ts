import { userResponseSchema } from "./user";
import * as z from "zod";

// Request
export const registerRequestSchema = z.object({
  name: z.string().trim().min(2, "Minimum 2 characters").max(255, "Name is too long"),
  email: z.email("Enter a valid email address"),
  // eslint-disable-next-line zod/prefer-string-schema-with-trim
  password: z.string().min(8, "Minimum 8 characters").max(128, "Password is too long"),
});
export type RegisterRequest = z.infer<typeof registerRequestSchema>;

export const loginRequestSchema = z.object({
  email: z.email("Enter a valid email address"),
  // eslint-disable-next-line zod/prefer-string-schema-with-trim
  password: z.string().min(1, "Enter your password").max(128),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

// Response
export const authResponseSchema = z.strictObject({
  user: userResponseSchema,
});
export type AuthResponse = z.infer<typeof authResponseSchema>;
