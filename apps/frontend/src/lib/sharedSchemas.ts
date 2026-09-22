import { countryCodeSchema, type Weekday } from '@slotbook/shared';
import * as z from 'zod';

export const countryOptionSchema = z.object({
  country: countryCodeSchema,
});
export type CountryOption = z.infer<typeof countryOptionSchema>;


export const WEEKDAY_BY_NAME = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
} as const satisfies Record<string, Weekday>;
export type WeekdayByName = keyof typeof WEEKDAY_BY_NAME;
