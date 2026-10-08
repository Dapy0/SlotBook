import * as z from "zod";
import { instantSchema } from "./common/codecs";
import {
  weekdaySchema,
  staffScheduleEntryResponseSchema,
  facilityScheduleEntryResponseSchema,
} from "./schedule";
import { emailInputSchema } from "./common/primitives";
import { bookingQuerySchema } from "./bookings";

// Request

export const createStaffMemberRequestSchema = z.object({ email: emailInputSchema });
export type CreateStaffMemberRequest = z.infer<typeof createStaffMemberRequestSchema>;

export const updateStaffMemberRequestSchema = z.object({ isActive: z.boolean() });
export type UpdateStaffMemberRequest = z.infer<typeof updateStaffMemberRequestSchema>;

export const addServiceToStaffMemberRequestSchema = z.object({
  serviceIds: z.array(z.string().trim()),
});
export type AddServiceToStaffMemberRequest = z.infer<typeof addServiceToStaffMemberRequestSchema>;
// Response

export const staffMemberResponseSchema = z.object({
  id: z.uuid(),
  facilityId: z.uuid(),
  isActive: z.boolean(),
  createdAt: instantSchema,
  updatedAt: instantSchema,
});

export type StaffMemberResponse = z.infer<typeof staffMemberResponseSchema>;
// Public
export const staffMemberPublicResponseSchema = z.object({
  id: z.uuid(),
  name: z.string().trim(),
  score: z.number().min(0).max(5).nullable(),
  reviewsCount: z.int().nonnegative(),
});
export type StaffMemberPublicResponse = z.infer<typeof staffMemberPublicResponseSchema>;

export const managedStaffMemberResponseSchema = staffMemberResponseSchema.extend({
  userId: z.uuid(),
  name: z.string().trim(),
  email: z.email(),
  serviceIds: z.array(z.uuid()),
  workDays: weekdaySchema.array(),
});

export type ManagedStaffMemberResponse = z.infer<typeof managedStaffMemberResponseSchema>;

export const staffMemberDetailsResponseSchema = managedStaffMemberResponseSchema.extend({
  schedule: staffScheduleEntryResponseSchema.array(),
});
export type StaffMemberDetailsResponse = z.infer<typeof staffMemberDetailsResponseSchema>;
export const staffMemberParamsSchema = z.object({ id: z.uuid(), staffId: z.uuid() });
export type StaffMemberParams = z.infer<typeof staffMemberParamsSchema>;

export const staffMeResponseSchema = z.object({
  staffMemberId: z.string().trim(),
  isActive: z.boolean(),
  facility: z.object({
    id: z.string().trim(),
    slug: z.string().trim(),
    name: z.string().trim(),
    timezone: z.string().trim(),
    currency: z.string().trim(),
  }),
  services: z.array(
    z.object({
      id: z.string().trim(),
      name: z.string().trim(),
      durationMinutes: z.int(),
      priceCents: z.int(),
      isActive: z.boolean(),
    }),
  ),

  schedule: staffScheduleEntryResponseSchema.array(),
  facilitySchedule: facilityScheduleEntryResponseSchema.array(),
});
export type StaffMeResponse = z.infer<typeof staffMeResponseSchema>;

export const staffBookingQuerySchema = bookingQuerySchema.omit({ staffMemberId: true });
export type StaffBookingQuery = z.infer<typeof staffBookingQuerySchema>;
