// app/actions/setCountry.ts
"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function setCountry(country: string) {
  if (!/^[A-Z]{2}$/.test(country)) return;

  (await cookies()).set("_sb_country", country, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: true,
  });

  revalidatePath("/", "layout");
}
