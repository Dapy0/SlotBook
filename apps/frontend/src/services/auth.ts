import { api } from '@/lib/api';
import type { LoginFormValues, RegisterFormValues } from '@/lib/validations/auth';

export interface AuthResponse {
  user: {
    id: string;
    email: string;

  };
}

export const register = (data: RegisterFormValues) => {
  return api<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const login = (data: LoginFormValues) => {
  return api<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const logout = () => {
  return api<{ success: boolean }>('/auth/logout', {
    method: 'POST',
  });
};
