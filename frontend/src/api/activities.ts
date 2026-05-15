import { api } from './client';
import type { Activity } from '@/types/api';

export type ListActivitiesParams = {
  sport?: string;
  city?: string;
  upcoming?: boolean;
};

export const listActivitiesApi = async (params: ListActivitiesParams = {}) => {
  const { data } = await api.get<{ activities: Activity[] }>('/activities', { params });
  return data.activities;
};

export const getActivityApi = async (id: string) => {
  const { data } = await api.get<{ activity: Activity }>(`/activities/${id}`);
  return data.activity;
};

export type CreateActivityInput = {
  title: string;
  description?: string;
  sportId: string;
  venueId?: string;
  startsAt: string;
  endsAt?: string;
  capacity: number;
  price?: number;
  privacy?: 'PUBLIC' | 'PRIVATE';
};

export const createActivityApi = async (input: CreateActivityInput) => {
  const { data } = await api.post<{ activity: Activity }>('/activities', input);
  return data.activity;
};

export const joinActivityApi = async (id: string) => {
  const { data } = await api.post<{ activity: Activity }>(`/activities/${id}/join`);
  return data.activity;
};

export const leaveActivityApi = async (id: string) => {
  const { data } = await api.post<{ activity: Activity }>(`/activities/${id}/leave`);
  return data.activity;
};

export const cancelActivityApi = async (id: string) => {
  await api.delete(`/activities/${id}`);
};

export const listMyActivitiesApi = async () => {
  const { data } = await api.get<{ activities: Activity[] }>('/activities/me');
  return data.activities;
};
