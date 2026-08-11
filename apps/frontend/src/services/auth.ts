import { api } from '@/lib/api';
import type { LoginFormValues, RegisterFormValues } from '@/lib/validations/auth';

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: string;

  };
}

export const authApi = {
  register: (data: RegisterFormValues) => {
    return api<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: (data: LoginFormValues) => {
    return api<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  logout: () => {
    return api<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    });
  },
};
