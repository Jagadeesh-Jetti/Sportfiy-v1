import { api } from './client';
import type { Venue } from '@/types/api';

export const toggleFavoriteApi = async (venueId: string) => {
  const { data } = await api.post<{ favorited: boolean }>(`/favorites/${venueId}/toggle`);
  return data.favorited;
};

export const listMyFavoritesApi = async () => {
  const { data } = await api.get<{ venues: Venue[] }>('/favorites/me');
  return data.venues;
};

export const myFavoriteIdsApi = async () => {
  const { data } = await api.get<{ ids: string[] }>('/favorites/me/ids');
  return new Set(data.ids);
};
