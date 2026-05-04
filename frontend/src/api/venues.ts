import { api } from './client';
import type { Slot, Venue, VenueListResponse } from '@/types/api';

export type ListVenuesParams = {
  sport?: string;
  city?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
};

export const listVenuesApi = async (params: ListVenuesParams = {}): Promise<VenueListResponse> => {
  const { data } = await api.get<VenueListResponse>('/venues', { params });
  return data;
};

export const getVenueApi = async (id: string): Promise<Venue> => {
  const { data } = await api.get<{ venue: Venue }>(`/venues/${id}`);
  return data.venue;
};

export const listMyVenuesApi = async (): Promise<Venue[]> => {
  const { data } = await api.get<{ venues: Venue[] }>('/venues/me/owned');
  return data.venues;
};

export type CreateVenueInput = {
  name: string;
  description?: string;
  location: string;
  city?: string;
  address?: string;
  images: string[];
  lat: number;
  lng: number;
  openingHour: number;
  closingHour: number;
  slotDurationMinutes: number;
  pricePerHour?: number;
  sportIds: string[];
};

export const createVenueApi = async (input: CreateVenueInput): Promise<Venue> => {
  const { data } = await api.post<{ venue: Venue }>('/venues', input);
  return data.venue;
};

export const updateVenueApi = async (
  id: string,
  input: Partial<CreateVenueInput>,
): Promise<Venue> => {
  const { data } = await api.patch<{ venue: Venue }>(`/venues/${id}`, input);
  return data.venue;
};

export const deleteVenueApi = async (id: string) => {
  const { data } = await api.delete<{ id: string }>(`/venues/${id}`);
  return data;
};

export const getAvailabilityApi = async (
  venueId: string,
  date: string,
): Promise<{ date: string; slots: Slot[] }> => {
  const { data } = await api.get<{ date: string; slots: Slot[] }>(
    `/venues/${venueId}/availability`,
    { params: { date } },
  );
  return data;
};

export const defineSlotsApi = async (
  venueId: string,
  body: { date: string; startHour: number; endHour: number; slotDurationMinutes?: number },
) => {
  const { data } = await api.post<{ date: string; attempted: number; created: number }>(
    `/venues/${venueId}/slots`,
    body,
  );
  return data;
};

export const defineSlotsBulkApi = async (
  venueId: string,
  body: {
    startDate: string;
    endDate: string;
    startHour: number;
    endHour: number;
    slotDurationMinutes?: number;
  },
) => {
  const { data } = await api.post<{
    startDate: string;
    endDate: string;
    attempted: number;
    created: number;
  }>(`/venues/${venueId}/slots/bulk`, body);
  return data;
};
