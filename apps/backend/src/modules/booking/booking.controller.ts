import type { FastifyReply, FastifyRequest } from 'fastify';
import type { BookingBody, BookingParams } from './booking.schema.ts';
import { createBookingForFacility, getAllFacilityBookings } from './booking.service.ts';

export async function getBookings(
  request: FastifyRequest<{ Params: BookingParams }>,
  response: FastifyReply,
) {
  const bookings = await getAllFacilityBookings(
    request.server.drizzle,
    request.user.id,
    request.params.id,
  );
  return response.send(bookings);
}

export async function createBooking(
  request: FastifyRequest<{ Params: BookingParams; Body: BookingBody }>,
  response: FastifyReply,
) {
  const booking = await createBookingForFacility(
    request.server.drizzle,
    request.user.id,
    request.params.id,
    request.body
  );
  return response.send(booking);
}
