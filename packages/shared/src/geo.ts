import * as z from "zod";

export const DEFAULT_COUNTRY = "PL";

export const countryCodeSchema = z.string().trim().toUpperCase().pipe(z.string().trim().length(2));

export const countryOptionSchema = z.object({
  country: countryCodeSchema,
});
export const countriesResponseSchema = z.array(countryOptionSchema);
export type CountryOption = z.infer<typeof countryOptionSchema>;

export const geoResponseSchema = z.object({ country: countryCodeSchema.nullable() });

const displayNamesCache = new Map<string, Intl.DisplayNames>();

export function countryName(code: string, locale = "en"): string {
  let dn = displayNamesCache.get(locale);
  if (!dn) {
    dn = new Intl.DisplayNames([locale], { type: "region" });
    displayNamesCache.set(locale, dn);
  }
  return dn.of(code.toUpperCase()) ?? code;
}

export function countryFlag(code: string): string {
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}
