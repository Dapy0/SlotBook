import { countryCodeSchema } from '@slotbook/shared';
import * as z from 'zod';

export const countryOptionSchema = z.object({
  country: countryCodeSchema,
});
export type CountryOption = z.infer<typeof countryOptionSchema>;
