import { api } from './client';
import type { Review } from '@/types/api';

export const listVenueReviewsApi = async (venueId: string) => {
  const { data } = await api.get<{ avgRating: number | null; reviewCount: number; reviews: Review[] }>(
    `/reviews/venue/${venueId}`,
  );
  return data;
};

export const canReviewVenueApi = async (venueId: string) => {
  const { data } = await api.get<{ canReview: boolean; existingReview: Review | null }>(
    `/reviews/venue/${venueId}/can-review`,
  );
  return data;
};

export const upsertReviewApi = async (
  venueId: string,
  input: { rating: number; comment?: string },
) => {
  const { data } = await api.post<{ review: Review }>(`/reviews/venue/${venueId}`, input);
  return data.review;
};

export const deleteReviewApi = async (reviewId: string) => {
  await api.delete(`/reviews/${reviewId}`);
};

export const replyToReviewApi = async (reviewId: string, reply: string) => {
  const { data } = await api.post<{ review: Review }>(`/reviews/${reviewId}/reply`, { reply });
  return data.review;
};
