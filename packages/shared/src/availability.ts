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

export const availabilityResponseSchema = z.object({
  days: availabilityDaySchema.array(),
});

export type AvailabilityResponse = z.infer<typeof availabilityResponseSchema>;
