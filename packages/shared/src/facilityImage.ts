import * as z from "zod";

export const FACILITY_IMAGE_MAX_COUNT = 10;
export const FACILITY_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const FACILITY_IMAGE_TYPES = [
  { mime: "image/jpeg", ext: "jpg" },
  { mime: "image/png", ext: "png" },
  { mime: "image/webp", ext: "webp" },
] as const;
export type FacilityImageMime = (typeof FACILITY_IMAGE_TYPES)[number]["mime"];
export type FacilityImageExt = (typeof FACILITY_IMAGE_TYPES)[number]["ext"];
export const FACILITY_IMAGE_ACCEPT = FACILITY_IMAGE_TYPES.map((t) => t.mime).join(",");

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
export const facilityImageKeySchema = z
  .string()
  .trim()
  .regex(new RegExp(`^facilities/${UUID}/${UUID}\\.(jpg|png|webp)$`));
export type FacilityImageKey = z.infer<typeof facilityImageKeySchema>;

export const facilityImageSchema = z.object({
  key: facilityImageKeySchema,
  url: z.url(),
});
export type FacilityImage = z.infer<typeof facilityImageSchema>;

export const facilityImagesResponseSchema = z.object({
  images: z.array(facilityImageSchema).max(FACILITY_IMAGE_MAX_COUNT),
});
export type FacilityImagesResponse = z.infer<typeof facilityImagesResponseSchema>;

export const deleteFacilityImageQuerySchema = z.object({
  key: facilityImageKeySchema,
});
export type DeleteFacilityImageQuery = z.infer<typeof deleteFacilityImageQuerySchema>;

export const reorderFacilityImagesRequestSchema = z.object({
  keys: z
    .array(facilityImageKeySchema)
    .min(1)
    .max(FACILITY_IMAGE_MAX_COUNT)
    .refine((keys) => new Set(keys).size === keys.length, { error: "Keys must be unique" }),
});
export type ReorderFacilityImagesRequest = z.infer<typeof reorderFacilityImagesRequestSchema>;
