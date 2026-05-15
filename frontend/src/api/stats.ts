import { api } from './client';
import type { Stats } from '@/types/api';

export const getStatsApi = async () => {
  const { data } = await api.get<Stats>('/stats');
  return data;
};
