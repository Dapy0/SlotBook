"use client";

import { toast } from "@/components/ui/toast";
import { api, ApiError } from "@/lib/api";
import { authMe, logout as logoutApi } from "@/services/auth";
import type { AuthMeResponse, AuthResponse, UserResponse } from "@slotbook/shared";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type AuthContextValue = {
  me: AuthMeResponse | null;
  user: UserResponse | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [me, setMe] = useState<AuthMeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await authMe();
      setMe(res);
    } catch (err) {
      if (err instanceof ApiError && err.status == 401) {
        setMe(null);
      } else {
        toast.add({
          title: err instanceof Error ? err.message : "Unknown error",
          description: "Error connecting to server",
          priority: "high",
          timeout: 3000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = async () => {
    await logoutApi();
    setMe(null);
    router.refresh();
  };

  return (
    <AuthContext.Provider
      value={{ user: me?.user ?? null, me, isLoading, logout, refetch: fetchUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
