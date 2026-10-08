import { headers } from "next/headers";
import { api } from "@/lib/api";
import { geoCountryResponseSchema, geoResponseSchema } from "@slotbook/shared";

export async function getCountries() {
  return await api("/geo/countries", geoCountryResponseSchema.array(), {
    next: { revalidate: 3600 },
  });
}

export async function getCountryByIp() {
  const incoming = await headers();
  const forwarded = incoming.get("x-forwarded-for") ?? incoming.get("x-real-ip") ?? "";

  try {
    const data = await api("/geo", geoResponseSchema, {
      cache: "no-store",
      headers: { "x-forwarded-for": forwarded },
    });
    return data.country ?? undefined;
  } catch {
    return undefined;
  }
}
