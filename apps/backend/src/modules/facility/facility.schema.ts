import z from "zod";

export const facilityParamsSchema = z.object({
  id: z.uuid(),
});
export const facilitySlugParamsSchema = z.object({
  slug: z.string(),
});
export type FacilityParams = z.infer<typeof facilityParamsSchema>;
