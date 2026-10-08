import "server-only";
import { api } from "@/lib/api";
import { cookies } from "next/headers";
import type z from "zod";

export async function apiWithAuth<T extends z.ZodType>(
  endpoint: string,
  schema: T,
  options: RequestInit = {},
) {
  const cookieStore = await cookies();
  return await api(endpoint, schema, {
    ...options,
    headers: {
      ...options.headers,
      cookie: cookieStore.toString(),
    },
  });
}
