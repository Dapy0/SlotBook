import type { FastifyReply, FastifyRequest } from "fastify";
import type { BookingParams, BookingPatchParams } from "./booking.schema.ts";
import {
  changeBookingStatus,
  createBookingForFacility,
  getFacilityBookingsForOwner,
} from "./booking.service.ts";
import type { BookingRequest, PatchBookingStatus } from "@slotbook/shared/bookings";
import type { CreateReviewRequest } from "@slotbook/shared/reviews";
import { createReviewForBooking } from "../review/review.service.ts";

export async function getBookings(
  request: FastifyRequest<{ Params: BookingParams }>,
  response: FastifyReply,
) {
  const bookings = await getFacilityBookingsForOwner(
    request.server.drizzle,
    request.user.id,
    request.params.id,
  );
  return response.send(bookings);
}

export async function createBooking(
  request: FastifyRequest<{ Params: BookingParams; Body: BookingRequest }>,
  response: FastifyReply,
) {
  const booking = await createBookingForFacility(
    request.server.drizzle,
    request.user.id,
    request.params.id,
    request.body,
  );
  return response.send(booking);
}

export async function patchBookingStatus(
  request: FastifyRequest<{ Params: BookingPatchParams; Body: PatchBookingStatus }>,
  response: FastifyReply,
) {
  const patchedBooking = await changeBookingStatus(
    request.server.drizzle,
    request.user.id,
    request.params.id,
    request.params.bookingId,
    request.body,
  );
  return response.send(patchedBooking);
}
export async function postReviewForBooking(
  request: FastifyRequest<{ Params: BookingPatchParams; Body: CreateReviewRequest }>,
  response: FastifyReply,
) {
  await createReviewForBooking(
    request.server.drizzle,
    request.user.id,
    request.params.bookingId,
    request.params.id,
    request.body,
  );
  return response.code(201);
}
