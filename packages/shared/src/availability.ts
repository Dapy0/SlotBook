import * as z from "zod";
import { calendarDateSchema, instantSchema } from "./codecs";
export const availabilitySlotSchema = z.object({
  start: instantSchema,
  end: instantSchema,
});
export const availabilityDaySchema = z.object({
  date: calendarDateSchema,
  slots: availabilitySlotSchema.array(),
});

export const availabilityResponseSchema = z.object({
  days: availabilityDaySchema.array(),
});

export type AvailabilitySlot = z.infer<typeof availabilitySlotSchema>;
export type AvailabilityDay = z.infer<typeof availabilityDaySchema>;
export type AvailabilityResponse = z.infer<typeof availabilityResponseSchema>;
