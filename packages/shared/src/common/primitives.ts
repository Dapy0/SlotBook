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
  .string().trim()
  .refine(isValidTimeZone, { error: "Incorrect IANA timezone" });
