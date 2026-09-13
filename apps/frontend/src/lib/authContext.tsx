"use client";

import { toast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import type { AuthResponseDTO } from "@slotbook/shared/auth";
import type { UserResponse } from "@slotbook/shared/user";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type AuthContextValue = {
  user: UserResponse | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await api<AuthResponseDTO>(`/auth/me`, {
        method: "GET",
      });
      setUser(res.user);
    } catch (err) {
      if (err instanceof Error) {
        toast.add({
          title: err.message,
          description: "Error connecting to server",
          priority: "high",
          timeout: 3000,
        });
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = async () => {
    await api(`/auth/logout`, {
      method: "GET",
      credentials: "include",
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout, refetch: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
