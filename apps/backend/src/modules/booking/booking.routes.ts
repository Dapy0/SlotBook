import { paramsPatchSchema, paramsSchema } from "./booking.schema.ts";

import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import {
  bookingResponseSchema,
  changeBookingStatusRequestSchema,
  createBookingRequestSchema,
  createReviewRequestSchema,
} from "@slotbook/shared";
import {
  changeBookingStatus,
  createBookingForFacility,
  getFacilityBookingsForOwner,
} from "./booking.service";
import { createReviewForBooking } from "../review/review.service";

export const bookingRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    "/:id/bookings",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: paramsSchema,
        response: {
          200: bookingResponseSchema.array(),
        },
      },
    },
    async (request, response) => {
      const bookings = await getFacilityBookingsForOwner(
        request.server.drizzle,
        request.user.id,
        request.params.id
      );
      return response.send(bookings);
    },
  );

  fastify.post(
    "/:id/bookings",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: paramsSchema,
        body: createBookingRequestSchema,
      },
    },
    async (request, response) => {
      const booking = await createBookingForFacility(
        request.server.drizzle,
        request.user.id,
        request.params.id,
        request.body
      );
      return response.send(booking);
    },
  );

  fastify.post(
    "/:id/bookings/:bookingId/reviews",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: paramsPatchSchema,
        body: createReviewRequestSchema,
      },
    },
    async (request, response) => {
      await createReviewForBooking(
        request.server.drizzle,
        request.user.id,
        request.params.bookingId,
        request.params.id,
        request.body
      );
      return response.code(201).send();
    },
  );
  fastify.patch(
    "/:id/bookings/:bookingId",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: paramsPatchSchema,
        body: changeBookingStatusRequestSchema,
      },
    },
    async (request, response) => {
      const patchedBooking = await changeBookingStatus(
        request.server.drizzle,
        request.user.id,
        request.params.id,
        request.params.bookingId,
        request.body
      );
      return response.send(patchedBooking);
    },
  );
};

export async function mineBookingsRoutes() {
  // fastify.get(
  //   '/mine',
  //   {
  //     onRequest: [fastify.authenticate],
  //   },
  //   // getMineBookings,
  // );
}
