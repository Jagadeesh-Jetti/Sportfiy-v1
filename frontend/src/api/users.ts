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
