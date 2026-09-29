import "server-only";
import { authMeResponseSchema, type AuthMeResponse } from "@slotbook/shared";
import { apiWithAuth } from "@/lib/api.server";
import { cache } from "react";
import { ApiError } from "./api";

export const getMe = cache(async (): Promise<AuthMeResponse | null> => {
  return await apiWithAuth("/auth/me", authMeResponseSchema).catch((err) => {
    if (err instanceof ApiError && err.status === 401) {
      return null;
    } else throw err;
  });
});
