import z from 'zod';

export const availabilityParamSchema = z.object({
  id: z.uuid(),
  staffId: z.uuid(),
});
export const availabilityQuerySchema = z.object({
  serviceId: z.uuid(),
  date: z.iso.date(),
});
export type AvailabilityParamsAndQuery = {
  Params: z.infer<typeof availabilityParamSchema>;
  Querystring: z.infer<typeof availabilityQuerySchema>;
};

