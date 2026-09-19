import { userSchema } from "./user";
import * as z from "zod";

// Request
export const authFieldsSchema = z.object({
  name: z.string().trim().min(2, "Minimum 2 characters").max(255, "Name is too long"),
  email: z.email("Enter a valid email address"),
  password: z.string().trim().min(8, "Minimum 8 characters"),
});
export const registerSchema = authFieldsSchema

export const loginSchema = authFieldsSchema.omit({ name: true });
export type RegisterRequest = z.infer<typeof registerSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;

// Response
export const authResponseSchema = z.strictObject({
  user: userSchema,
});
export type AuthResponse = z.infer<typeof authResponseSchema>;
