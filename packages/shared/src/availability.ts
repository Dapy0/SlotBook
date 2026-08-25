import z from 'zod';
export const availabilitySlotSchema = z.object({
  start: z.iso.datetime(),
  end: z.iso.datetime(),
});
