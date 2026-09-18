import type { FastifyInstance } from "fastify";
import {
  paramsPatchSchema,
  paramsSchema,
  type BookingParams,
  type BookingPatchParams,
} from "./booking.schema.ts";
import {
  getBookings,
  createBooking,
  patchBookingStatus,
  postReviewForBooking,
} from "./booking.controller.ts";
import z from "zod";
import {
  bookingRequestSchema,
  bookingResponseSchema,
  patchBookingStatusSchema,
  type BookingRequest,
  type PatchBookingStatus,
} from "@slotbook/shared/bookings";
import {
  createReviewRequestSchema,
  type CreateReviewRequest,
} from "@slotbook/shared/reviews";

export async function bookingRoutes(fastify: FastifyInstance) {
  fastify.get<{ Params: BookingParams }>(
    "/:id/bookings",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: paramsSchema,
        response: {
          200: z.array(bookingResponseSchema),
        },
      },
    },
    getBookings,
  );

  fastify.post<{ Params: BookingParams; Body: BookingRequest }>(
    "/:id/bookings",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: paramsSchema,
        body: bookingRequestSchema,
      },
    },
    createBooking,
  );

  fastify.post<{ Params: BookingPatchParams; Body: CreateReviewRequest }>(
    "/:id/bookings/:bookingId/reviews",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: paramsPatchSchema,
        body: createReviewRequestSchema,
      },
    },
    postReviewForBooking,
  );
  fastify.patch<{ Params: BookingPatchParams; Body: PatchBookingStatus }>(
    "/:id/bookings/:bookingId",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: paramsPatchSchema,
        body: patchBookingStatusSchema,
      },
    },
    patchBookingStatus,
  );
}

export async function mineBookingsRoutes() {
  // fastify.get(
  //   '/mine',
  //   {
  //     onRequest: [fastify.authenticate],
  //   },
  //   // getMineBookings,
  // );
}
