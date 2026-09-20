import * as z from "zod";
import { countryCodeSchema } from "./common/primitives";


// Response

export const geoResponseSchema = z.object({ country: countryCodeSchema.nullable() });
export type GeoResponse = z.infer<typeof geoResponseSchema>;
