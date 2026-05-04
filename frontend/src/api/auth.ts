import { api } from './client';
import type { AuthResponse, User } from '@/types/api';

export const signupApi = async (input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'PLAYER' | 'MERCHANT';
}) => {
  const { data } = await api.post<AuthResponse>('/auth/signup', input);
  return data;
};

export const loginApi = async (input: { email: string; password: string }) => {
  const { data } = await api.post<AuthResponse>('/auth/login', input);
  return data;
};

export const meApi = async () => {
  const { data } = await api.get<{ user: User }>('/auth/me');
  return data.user;
};
