import * as z from "zod";
import { instantSchema } from "./common/codecs";

// Request

export const createStaffMemberSchema = z.object({
  userId: z.uuid(),
  isActive: z.boolean().default(true),
});

export type CreateStaffMemberRequest = z.infer<typeof createStaffMemberSchema>;
export const updateStaffMemberRequestSchema = z.object({ isActive: z.boolean() });
export type UpdateStaffMemberRequest = z.infer<typeof updateStaffMemberRequestSchema>;

// Response

export const staffMemberResponseSchema = z.object({
  id: z.uuid(),
  facilityId: z.uuid(),
  isActive: z.boolean(),
  name: z.string().trim(),
  score: z.number().min(0).max(5).nullable(),
  reviewsCount: z.int().nonnegative(),
  createdAt: instantSchema,
  updatedAt: instantSchema,
});

export type StaffMemberResponse = z.infer<typeof staffMemberResponseSchema>;
// Public
export const staffMemberPublicResponseSchema = staffMemberResponseSchema.pick({
  id: true,
  name: true,
  score: true,
  reviewsCount: true,
});
export type StaffMemberPublicResponse = z.infer<typeof staffMemberPublicResponseSchema>;
