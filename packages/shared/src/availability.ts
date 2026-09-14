import * as z from "zod";
import { wallTimeSchema } from './codecs';
export const availabilitySlotSchema = z.object({
  start: wallTimeSchema,
  end: wallTimeSchema,
});
export type AvailabilitySlot = z.infer<typeof availabilitySlotSchema>;
