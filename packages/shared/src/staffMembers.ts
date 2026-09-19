import * as z from "zod";
import { instantSchema } from "./common/codecs";

// Request DTOs

export const createStaffMemberSchema = z.object({
  facilityId: z.uuid(),
  userId: z.uuid(),
  isActive: z.boolean().default(true),
});

export type CreateStaffMemberRequest = z.infer<typeof createStaffMemberSchema>;
export const updateStaffMemberSchema = createStaffMemberSchema.partial();
export type UpdateStaffMemberRequest = z.infer<typeof updateStaffMemberSchema>;

// Response DTOs

export const staffMemberResponseSchema = createStaffMemberSchema.extend({
  id: z.uuid(),
  score: z.string().trim().nullable(),
  reviewsCount: z.number(),
  name: z.string().trim(),
  createdAt: instantSchema,
  updatedAt: instantSchema,
});
export type StaffMemberResponseDTO = z.infer<typeof staffMemberResponseSchema>;
