import { api } from './client';
import type { Sport } from '@/types/api';

export const listSportsApi = async (): Promise<Sport[]> => {
  const { data } = await api.get<{ sports: Sport[] }>('/sports');
  return data.sports;
};
