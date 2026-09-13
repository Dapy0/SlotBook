import z from "zod";
import { timestamp } from "drizzle-orm/pg-core";

export const paramsSchema = z.object({
  id: z.string().nonempty(),
});
export type BookingParams = z.infer<typeof paramsSchema>;

export const paramsPatchSchema = z.object({
  id: z.string().nonempty(),
  bookingId: z.string().nonempty(),
});
export type BookingPatchParams = z.infer<typeof paramsPatchSchema>;
export const bodySchema = z.object({
  staffMemberId: z.uuid(),
  serviceId: z.uuid(),
  startDatetime: z.iso.datetime({ offset: true, local: false }).transform((d) => new Date(d)),
});
export type BookingBody = z.infer<typeof bodySchema>;

export const updateBookingSchema = bodySchema.partial();
export type UpdateBookingBody = z.infer<typeof updateBookingSchema>;
