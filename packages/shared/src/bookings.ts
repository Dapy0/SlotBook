import * as z from "zod";
import { instantSchema } from "./common/codecs";
import { currencyCodeSchema } from "./common/primitives";

export const BOOKING_STATUSES = ["pending", "confirmed", "canceled"] as const;
export const bookingStatusSchema = z.enum(BOOKING_STATUSES);
export type BookingStatus = z.infer<typeof bookingStatusSchema>;

// Request

export const createBookingRequestSchema = z.object({
  staffMemberId: z.uuid(),
  serviceId: z.uuid(),
  startsAt: instantSchema,
});
export type CreateBookingRequest = z.infer<typeof createBookingRequestSchema>;

export const changeBookingStatusRequestSchema = z.object({
  status: bookingStatusSchema.extract(["confirmed", "canceled"]),
});
export type ChangeBookingStatusRequest = z.infer<typeof changeBookingStatusRequestSchema>;

// Response

export const bookingResponseSchema = z.object({
  id: z.uuid(),
  clientId: z.uuid(),
  facilityId: z.uuid(),
  staffMemberId: z.uuid(),
  serviceId: z.uuid(),
  startsAt: instantSchema,
  endsAt: instantSchema,
  status: bookingStatusSchema,
  createdAt: instantSchema,
  priceCents: z.int().nonnegative(),
  currency: currencyCodeSchema,
});
export type BookingResponse = z.infer<typeof bookingResponseSchema>;

export const bookingWithDetailsResponseSchema = bookingResponseSchema.extend({
  facilityName: z.string().trim(),
  facilitySlug: z.string().trim(),
  facilityTimezone: z.string().trim(),
  serviceName: z.string().trim(),
  staffMemberName: z.string().trim(),
});
export type BookingWithDetailsResponse = z.infer<typeof bookingWithDetailsResponseSchema>;

export const facilityBookingResponseSchema = bookingWithDetailsResponseSchema.extend({
  client: z.object({ clientName: z.string().trim(), clientEmail: z.email() }),
});

export type FacilityBookingResponse = z.infer<typeof facilityBookingResponseSchema>;
export const bookingQuerySchema = z.object({
  from: z.iso.date().optional(),
  to: z.iso.date().optional(),
  status: bookingStatusSchema.optional(),
  staffMemberId: z.uuid().optional(),
});
export type BookingQuery = z.infer<typeof bookingQuerySchema>;
export const myBookingsQuerySchema = z.object({
  scope: z.literal(["upcoming", "past"]).default("upcoming"),
});
export type MyBookingsQuery = z.infer<typeof myBookingsQuerySchema>;
