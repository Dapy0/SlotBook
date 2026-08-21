import z from 'zod';

export const tsRangeSchema = z.object({
  start: z.date().nullable(),
  end: z.date().nullable(),
  startInclusive: z.boolean(),
  endInclusive: z.boolean(),
});

export const bookingRequestSchema = z.object({

  clientId: z.uuid(),

  facilityId: z.uuid(),

  staffMemberId: z.uuid(),
  serviceId: z.uuid(),
  timeRange: tsRangeSchema,

});
export type CreateBookingRequest = z.infer<typeof bookingRequestSchema>;
const updateBookingSchema = bookingRequestSchema.partial()
export type UpdateBookingRequest = z.infer<typeof updateBookingSchema>;


// Response DTOs

export const bookingResponseSchema = bookingRequestSchema.extend({
  id: z.uuid(),
  createdAt: z.coerce.date(),
  status: z.enum(['pending', 'confirmed', 'canceled']).default('pending'),
});
export type BookingResponse = z.infer<typeof bookingResponseSchema>;
