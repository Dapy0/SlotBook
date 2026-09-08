import z from 'zod';

export const facilityListQuerySchema = z.object({
  country: z.string(),
  limit: z.coerce.number().nonnegative().optional(),
});
export type FacilityListQuery = z.infer<typeof facilityListQuerySchema>;
export const facilityParamsSchema = z.object({
  id: z.uuid(),
});
export type FacilityParams = z.infer<typeof facilityParamsSchema>;

export const facilityCategoryQuerystringSchema = z.object({
  limit: z.coerce.number().nonnegative().optional(),
});
export type FacilityCategoryQuerystring = z.infer<typeof facilityCategoryQuerystringSchema>;
