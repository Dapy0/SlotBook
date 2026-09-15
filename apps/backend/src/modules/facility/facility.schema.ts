import z from "zod";


export const facilityParamsSchema = z.object({
  id: z.uuid(),
});
export type FacilityParams = z.infer<typeof facilityParamsSchema>;

export const facilityCategoryQuerystringSchema = z.object({
  limit: z.coerce.number().nonnegative().optional(),
  country: z.string(),
});
export type FacilityCategoryQuerystring = z.infer<typeof facilityCategoryQuerystringSchema>;
