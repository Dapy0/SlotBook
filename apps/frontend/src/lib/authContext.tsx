'use client';

import type { UserResponse } from '@slotbook/shared/user';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';


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
      const res = await fetch(`${process.env.BACKEND_URL}/auth/me`, {
        credentials: 'include',
      });
      const resp:{user:UserResponse} = await res.json()
      setUser(res.ok ? resp.user : null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = async () => {
    await fetch(`${process.env.BACKEND_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
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
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
