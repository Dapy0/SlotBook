import * as z from "zod";
import { ANY_FIELD_MESSAGE, hasAnyField } from "./common/refinements";

export const CONFIRMATION_MODES = ["manual", "auto"] as const;
export const confirmationModeSchema = z.enum(CONFIRMATION_MODES);
export type ConfirmationMode = z.infer<typeof confirmationModeSchema>;

export const BOOKING_POLICY_LIMITS = {
  clientCancelCutoffMinutes: { min: 0, max: 7 * 24 * 60 },
  bookingLeadMinutes: { min: 0, max: 7 * 24 * 60 },
  bookingHorizonDays: { min: 1, max: 365 },
} as const;
const L = BOOKING_POLICY_LIMITS;

export function isLeadWithinHorizon(leadMinutes: number, horizonDays: number): boolean {
  return leadMinutes < horizonDays * 24 * 60;
}
export const bookingPolicySchema = z.object({
  confirmationMode: confirmationModeSchema,
  clientCancelCutoffMinutes: z
    .int()
    .min(L.clientCancelCutoffMinutes.min)
    .max(L.clientCancelCutoffMinutes.max),
  bookingLeadMinutes: z.int().min(L.bookingLeadMinutes.min).max(L.bookingLeadMinutes.max),
  bookingHorizonDays: z.int().min(L.bookingHorizonDays.min).max(L.bookingHorizonDays.max),
});

export const updateBookingPolicyRequestSchema = bookingPolicySchema
  .partial()
  .refine(hasAnyField, { error: ANY_FIELD_MESSAGE });
export type UpdateBookingPolicyRequest = z.infer<typeof updateBookingPolicyRequestSchema>;

export const bookingPolicyResponseSchema = bookingPolicySchema;
export type BookingPolicyResponse = z.infer<typeof bookingPolicyResponseSchema>;

export const publicBookingPolicySchema = bookingPolicySchema.pick({
  confirmationMode: true,
  clientCancelCutoffMinutes: true,
});
export type PublicBookingPolicy = z.infer<typeof publicBookingPolicySchema>;
