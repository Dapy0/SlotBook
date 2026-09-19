import { registerSchema } from "@slotbook/shared";
import * as z from "zod";

export const registerValidationSchema = registerSchema
  .extend({
    confirmPassword: z.string().trim().min(8, "Minimum 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    error: "Passwords do not match",
  });

export type RegisterValidation = z.infer<typeof registerValidationSchema>;
