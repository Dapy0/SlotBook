import { bookingRequestSchema } from '@slotbook/shared/bookings';
import z from 'zod';
import { timestamp } from 'drizzle-orm/pg-core';

export const paramsSchema = z.object({
  id: z.string().nonempty(),
});
export type BookingParams = z.infer<typeof paramsSchema>;
export const bodySchema = bookingRequestSchema
  .omit({
    clientId: true,
    facilityId: true,
    timeRange: true,
  })
  .extend({
    startDatetime: z.iso.datetime({ offset: true, local: false }).transform((date)=>new Date(date)),
  });
export type BookingBody = z.infer<typeof bodySchema>;
