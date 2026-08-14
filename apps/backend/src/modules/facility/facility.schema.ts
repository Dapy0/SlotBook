import z from 'zod';

export const facilityListQuerySchema = z.object({
  city: z.string().optional(),
});
export const facilityParamsSchema = z.object({
  id: z.uuid(),
});
export type FacilityParams = z.infer<typeof facilityParamsSchema>;
