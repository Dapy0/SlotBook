import { emailInputSchema } from "./common/primitives";
import { userResponseSchema } from "./user";
import { facilityResponseSchema } from "./facility";
import * as z from "zod";

// Request
export const registerRequestSchema = z.object({
  name: z.string().trim().min(2, "Minimum 2 characters").max(255, "Name is too long"),
  email: emailInputSchema,
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

const ownedFacility = facilityResponseSchema.pick({
  id: true,
  slug: true,
  name: true,
  timezone: true,
  isPublished: true,
  currency: true,
});
const staffMembershipSchema = z.object({
  staffMemberId: z.uuid(),
  facilityId: z.uuid(),
  facilitySlug: z.string().trim(),
  facilityName: z.string().trim(),
  isActive: z.boolean(),
});
export type StaffMembership = z.infer<typeof staffMembershipSchema>;
export const authMeResponseSchema = z.strictObject({
  user: userResponseSchema,
  ownedFacilities: ownedFacility.array(),
  staffMembership: staffMembershipSchema.nullable(),
});
export type AuthMeResponse = z.infer<typeof authMeResponseSchema>;
