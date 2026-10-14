import z from "zod";

export const facilityParamsSchema = z.object({
  id: z.uuid(),
});
export const facilitySlugParamsSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(255)
    .regex(/^[a-z0-9-]+$/),
});
export type FacilityParams = z.infer<typeof facilityParamsSchema>;
