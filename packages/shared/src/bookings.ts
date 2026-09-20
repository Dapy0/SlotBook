import * as z from "zod";
import { instantSchema } from "./common/codecs";
import { currencyCodeSchema } from './common/primitives';

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
});
export type BookingResponse = z.infer<typeof bookingResponseSchema>;


export const bookingWithDetailsResponseSchema = bookingResponseSchema.extend({
  facilityName: z.string().trim(),
  facilitySlug: z.string().trim(), 
  serviceName: z.string().trim(),
  staffMemberName: z.string().trim(),
  priceCents: z.int().nonnegative(),
  currency: currencyCodeSchema,
});
export type BookingWithDetailsResponse = z.infer<typeof bookingWithDetailsResponseSchema>;
