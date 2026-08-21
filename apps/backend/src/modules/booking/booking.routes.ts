import type { FastifyInstance } from 'fastify';
import { bodySchema, paramsSchema, type BookingBody, type BookingParams } from './booking.schema.ts';
import { getBookings, createBooking } from './booking.controller.ts';
import z from 'zod';
import { bookingResponseSchema } from '@slotbook/shared/bookings';

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
}

export async function mineBookingsRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/mine',
    {
      onRequest: [fastify.authenticate],
    },
    // getMineBookings,
  );
}
