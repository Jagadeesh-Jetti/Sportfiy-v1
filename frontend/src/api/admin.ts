import { api } from './client';

export type AdminOverview = {
  users: { total: number; merchants: number };
  venues: { total: number; verified: number };
  bookings: { total: number; cancelled: number; cancelRate: number };
  reviews: { total: number; avg: number | null };
};

export const adminOverviewApi = async () => {
  const { data } = await api.get<AdminOverview>('/admin/overview');
  return data;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: 'PLAYER' | 'MERCHANT' | 'ADMIN';
  phone: string | null;
  loyaltyPoints: number;
  createdAt: string;
};

export const adminListUsersApi = async (params: { q?: string; role?: AdminUser['role'] } = {}) => {
  const { data } = await api.get<{ users: AdminUser[] }>('/admin/users', { params });
  return data.users;
};

export type AdminVenue = {
  id: string;
  name: string;
  city: string | null;
  location: string;
  avgRating: number | null;
  reviewCount: number;
  isVerified: boolean;
  owner: { id: string; name: string; email: string };
  createdAt: string;
};

export const adminListVenuesApi = async () => {
  const { data } = await api.get<{ venues: AdminVenue[] }>('/admin/venues');
  return data.venues;
};

export const adminToggleVenueVerifyApi = async (id: string) => {
  const { data } = await api.post<{ venue: { id: string; isVerified: boolean } }>(
    `/admin/venues/${id}/verify`,
  );
  return data.venue;
};

export const adminListBookingsApi = async () => {
  const { data } = await api.get<{ bookings: Array<{
    id: string;
    status: string;
    createdAt: string;
    user: { id: string; name: string; email: string };
    venue: { id: string; name: string; city: string | null };
    sport: { id: string; name: string };
    slot: { startTime: string; endTime: string } | null;
  }> }>('/admin/bookings');
  return data.bookings;
};

export const adminListReviewsApi = async () => {
  const { data } = await api.get<{ reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    user: { id: string; name: string };
    venue: { id: string; name: string };
  }> }>('/admin/reviews');
  return data.reviews;
};

export const adminDeleteReviewApi = async (id: string) => {
  await api.delete(`/admin/reviews/${id}`);
};
