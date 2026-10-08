import * as z from "zod";

function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone });
    return true;
  } catch {
    return false;
  }
}

export const timezoneSchema = z
  .string()
  .trim()
  .refine(isValidTimeZone, { error: "Incorrect IANA timezone" });

// code schemas
export const countryCodeSchema = z
  .string()
  .trim()
  .regex(/^[A-Z]{2}$/);
export const currencyCodeSchema = z
  .string()
  .trim()
  .regex(/^[A-Z]{3}$/);
export const countryCodeInputSchema = z.string().trim().toUpperCase().pipe(countryCodeSchema);
export const currencyCodeInputSchema = z.string().trim().toUpperCase().pipe(currencyCodeSchema);
// email
export const emailInputSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address"));
