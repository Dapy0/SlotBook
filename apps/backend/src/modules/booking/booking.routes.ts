import { paramsPatchSchema, paramsSchema } from "./booking.schema.ts";

import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import {
  bookingQuerySchema,
  bookingResponseSchema,
  bookingWithDetailsResponseSchema,
  changeBookingStatusRequestSchema,
  createBookingRequestSchema,
  createReviewRequestSchema,
  facilityBookingResponseSchema,
  myBookingsQuerySchema,
} from "@slotbook/shared";
import {
  changeBookingStatus,
  createBookingForFacility,
  getFacilityBookingsForOwner,
  getMineBookings,
} from "./booking.service";
import { createReviewForBooking } from "../review/review.service";
import z from "zod";

export const bookingRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    "/",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: paramsSchema,
        querystring: bookingQuerySchema,
        response: {
          200: facilityBookingResponseSchema.array(),
        },
      },
    },
    async (request, response) => {
      const bookings = await getFacilityBookingsForOwner(
        request.server.drizzle,
        request.user.id,
        request.params.id,
        request.query,
      );
      return response.send(bookings);
    },
  );

  fastify.post(
    "/",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: paramsSchema,
        body: createBookingRequestSchema,
        response: { 201: bookingResponseSchema },
      },
    },
    async (request, response) => {
      const booking = await createBookingForFacility(
        request.server.drizzle,
        request.user.id,
        request.params.id,
        request.body,
      );
      return response.code(201).send(booking);
    },
  );

  fastify.post(
    "/:bookingId/reviews",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: paramsSchema.extend({ bookingId: z.uuid() }),
        body: createReviewRequestSchema,
      },
    },
    async (request, response) => {
      await createReviewForBooking(
        request.server.drizzle,
        request.user.id,
        request.params.bookingId,
        request.params.id,
        request.body,
      );
      return response.code(201).send();
    },
  );
};

export const mineBookingsRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    "/mine",
    {
      onRequest: [fastify.authenticate],
      schema: {
        querystring: myBookingsQuerySchema,
        response: {
          200: bookingWithDetailsResponseSchema.array(),
        },
      },
    },
    async (request, response) => {
      const myBookings = await getMineBookings(
        request.server.drizzle,
        request.user.id,
        request.query.scope,
      );
      return response.send(myBookings);
    },
  );
  fastify.patch(
    "/:bookingId",
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
        request.params.bookingId,
        request.body.status,
      );
      return response.send(patchedBooking);
    },
  );
};
