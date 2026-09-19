import { api } from "@/lib/api";
import type { AuthResponse, LoginRequest, RegisterRequest } from "@slotbook/shared/auth";

export const register = (data: RegisterRequest) => {
  return api<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const login = (data: LoginRequest) => {
  return api<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const logout = () => {
  return api<{ success: boolean }>("/auth/logout", {
    method: "GET",
  });
};
