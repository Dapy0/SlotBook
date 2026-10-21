import * as z from "zod";
import { instantSchema } from "./common/codecs";
import { currencyCodeSchema } from "./common/primitives";
import { myReviewSchema } from './reviews';

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

export const CANCEL_REASON_PRESETS = [
  "STAFF_UNAVAILABLE",
  "VENUE_CLOSED",
  "DOUBLE_BOOKING",
  "CLIENT_REQUEST",
] as const;

export const changeBookingStatusRequestSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("confirmed") }),
  z.object({
    status: z.literal("canceled"),
    reason: z.string().trim().min(1).max(200).optional(),
  }),
]);
export type ChangeBookingStatusRequest = z.infer<typeof changeBookingStatusRequestSchema>;

// Response
export const CANCEL_ACTORS = ["client", "staff", "owner", "system"] as const;
export const cancelActorSchema = z.enum(CANCEL_ACTORS);
export type CancelActor = z.infer<typeof cancelActorSchema>;

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
  cancelableUntil: instantSchema,
  canceledAt: instantSchema.nullable(),
  canceledBy: cancelActorSchema.nullable(),
  cancelReason: z.string().trim().nullable(),
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

export const clientBookingResponseSchema = bookingWithDetailsResponseSchema.extend({
  review: myReviewSchema.nullable(),
});
export type ClientBookingResponse = z.infer<typeof clientBookingResponseSchema>;


//

export type Actors = Exclude<CancelActor, "system">;

export const TRANSITIONS: Record<
  BookingStatus,
  Partial<Record<BookingStatus, readonly Actors[]>>
> = {
  pending: { confirmed: ["staff", "owner"], canceled: ["client", "owner", "staff"] },
  confirmed: { canceled: ["client", "owner", "staff"] },
  canceled: {},
};
export type TransitionCheck = "ok" | "invalid" | "forbidden";

export function checkTransition(
  from: BookingStatus,
  to: BookingStatus,
  actors: Actors[],
): TransitionCheck {
  const allowed = TRANSITIONS[from][to];
  if (!allowed) {
    return "invalid";
  }
  return actors.some((actor) => allowed.includes(actor)) ? "ok" : "forbidden";
}
export function canClientCancel(
  booking: Pick<BookingResponse, "status" | "cancelableUntil">,
  now: Date,
): boolean {
  return booking.status !== "canceled" && now < booking.cancelableUntil;
}
