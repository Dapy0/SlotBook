import { headers } from "next/headers";
import { api } from "@/lib/api";
import {
  countriesResponseSchema,
  geoResponseSchema,
  type CountryOption,
} from "@slotbook/shared/geo";

export async function getCountries(): Promise<CountryOption[]> {
  const data = await api<unknown>("/geo/countries", { next: { revalidate: 3600 } });
  return countriesResponseSchema.parse(data);
}

export async function getCountryByIp(): Promise<string | undefined> {
  const incoming = await headers();
  const forwarded = incoming.get("x-forwarded-for") ?? incoming.get("x-real-ip") ?? "";

  try {
    const data = await api<unknown>("/geo", {
      cache: "no-store",
      headers: { "x-forwarded-for": forwarded },
    });
    return geoResponseSchema.parse(data).country ?? undefined;
  } catch {
    return undefined;
  }
}
