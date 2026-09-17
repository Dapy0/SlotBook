import z from "zod";

export const availabilityParamSchema = z.object({
  id: z.uuid(),
});
export const availabilityQuerySchema = z.object({
  service: z.uuid(),
  staff: z.uuid(),
});
export type AvailabilityParamsAndQuery = {
  Params: z.infer<typeof availabilityParamSchema>;
  Querystring: z.infer<typeof availabilityQuerySchema>;
};
