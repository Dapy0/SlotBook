import z from "zod";

export const availabilityParamSchema = z.object({
  id: z.uuid(),
});
export const availabilityParamWithSlugSchema = z.object({
  slug: z.string(),
});

