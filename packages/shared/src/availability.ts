import * as z from "zod";
import { calendarDateSchema, instantSchema } from "./common/codecs";

const availabilitySlotSchema = z.object({
  startsAt: instantSchema,
  endsAt: instantSchema,
  staffMemberIds: z.array(z.uuid()),
});
const availabilityDaySchema = z.object({
  date: calendarDateSchema,
  slots: availabilitySlotSchema.array(),
});
// Query
export const availabilityQuerySchema = z.object({
  facilityId: z.uuid(),
  staffId: z.uuid(),
  serviceId: z.uuid(),
});

export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;

// Response
export const availabilityResponseSchema = z.object({
  days: availabilityDaySchema.array(),
});

export type AvailabilityResponse = z.infer<typeof availabilityResponseSchema>;
