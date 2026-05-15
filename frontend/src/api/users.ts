import { api } from './client';
import type { User } from '@/types/api';

export const getMyProfileApi = async (): Promise<User> => {
  const { data } = await api.get<{ user: User }>('/users/me');
  return data.user;
};

export const updateMyProfileApi = async (input: {
  name?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  skill?: 'BEGINNER' | 'INTERMEDIATE' | 'PRO';
}): Promise<User> => {
  const { data } = await api.patch<{ user: User }>('/users/me', input);
  return data.user;
};

export const changePasswordApi = async (input: {
  currentPassword: string;
  newPassword: string;
}) => {
  const { data } = await api.post<{ ok: true }>('/users/me/change-password', input);
  return data;
};

export const deleteMyAccountApi = async (input: { password: string }) => {
  const { data } = await api.delete<{ ok: true }>('/users/me', {
    data: { ...input, confirm: 'DELETE' },
  });
  return data;
};

export const exportMyDataApi = async () => {
  // Returns the raw blob so the caller can download it as JSON.
  const res = await api.get('/users/me/export', { responseType: 'blob' });
  return res.data as Blob;
};
