import { api } from './client';
import type { Booking } from '@/types/api';

export const createBookingApi = async (input: { slotId: string; sportId: string }) => {
  const { data } = await api.post<{ booking: Booking }>('/bookings', input);
  return data.booking;
};

export const listMyBookingsApi = async (): Promise<{ upcoming: Booking[]; past: Booking[] }> => {
  const { data } = await api.get<{ upcoming: Booking[]; past: Booking[] }>('/bookings/me');
  return data;
};

export const cancelBookingApi = async (id: string) => {
  const { data } = await api.patch<{ booking: Booking }>(`/bookings/${id}/cancel`);
  return data.booking;
};

export const listVenueBookingsApi = async (venueId: string) => {
  const { data } = await api.get<{ bookings: Booking[] }>(`/bookings/venue/${venueId}`);
  return data.bookings;
};
