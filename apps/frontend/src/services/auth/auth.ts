import { api } from '@/lib/api';
import type { LoginFormValues, RegisterFormValues } from '@/lib/validations/auth';
import type { AuthResponseDTO } from '@slotbook/shared/auth';

export const register = (data: RegisterFormValues) => {
  return api<AuthResponseDTO>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const login = (data: LoginFormValues) => {
  return api<AuthResponseDTO>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const logout = () => {
  return api<{ success: boolean }>('/auth/logout', {
    method: 'GET',
  });
};
