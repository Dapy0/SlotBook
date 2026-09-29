import { api } from "@/lib/api";
import * as z from "zod";
import { authMeResponseSchema, authResponseSchema, type LoginRequest, type RegisterRequest } from "@slotbook/shared";
export async function authMe() {
  return await api(`/auth/me`, authMeResponseSchema);
}

export async function register(data: RegisterRequest) {
  return await api("/auth/register", authResponseSchema, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function login(data: LoginRequest) {
  return await api("/auth/login", authResponseSchema, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function logout() {
  return api("/auth/logout", z.object({ success: z.boolean() }));
}
