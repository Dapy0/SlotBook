import z from "zod";


export const facilityParamsSchema = z.object({
  id: z.uuid(),
});
export type FacilityParams = z.infer<typeof facilityParamsSchema>;

