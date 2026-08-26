import type { FastifyInstance } from 'fastify';
import { bodySchema, paramsPatchSchema, paramsSchema, type BookingBody, type BookingParams, type BookingPatchParams, type UpdateBookingBody } from './booking.schema.ts';
import { getBookings, createBooking, patchBookingStatus } from './booking.controller.ts';
import z from 'zod';
import { bookingResponseSchema, patchBookingStatusSchema, type PatchBookingStatus } from '@slotbook/shared/bookings';

export async function bookingRoutes(fastify: FastifyInstance) {
  fastify.get<{ Params: BookingParams }>(
    '/:id/bookings',
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

  fastify.post<{ Params: BookingParams; Body: BookingBody }>(
    '/:id/bookings',
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: paramsSchema,
        body: bodySchema,
      },
    },
    createBooking,
  );
  fastify.patch<{ Params: BookingPatchParams; Body: PatchBookingStatus }>(
    '/:id/bookings/:bookingId',
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

export async function mineBookingsRoutes(fastify: FastifyInstance) {
  // fastify.get(
  //   '/mine',
  //   {
  //     onRequest: [fastify.authenticate],
  //   },
  //   // getMineBookings,
  // );
}
