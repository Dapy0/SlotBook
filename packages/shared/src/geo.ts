import * as z from "zod";
import { countryCodeSchema } from "./common/primitives";

// Response

export const geoResponseSchema = z.object({ country: countryCodeSchema.nullable() });
export type GeoResponse = z.infer<typeof geoResponseSchema>;

export const geoCountryResponseSchema = z.object({
  country: z.string().trim(),
  facilitiesCount: z.int().positive(),
});
export type GeoCountryResponse = z.infer<typeof geoCountryResponseSchema>;
