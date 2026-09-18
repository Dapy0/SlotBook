import z from "zod";

export const paramsSchema = z.object({
  id: z.string().nonempty(),
});
export type BookingParams = z.infer<typeof paramsSchema>;

export const paramsPatchSchema = z.object({
  id: z.string().nonempty(),
  bookingId: z.string().nonempty(),
});
export type BookingPatchParams = z.infer<typeof paramsPatchSchema>;
