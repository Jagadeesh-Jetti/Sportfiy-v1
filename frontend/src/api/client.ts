import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/auth.store';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      const { token, logout } = useAuthStore.getState();
      if (token) {
        logout();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
        }
      }
    }
    return Promise.reject(err);
  },
);

export type ApiError = {
  error: string;
  code?: string;
  issues?: { path: string; message: string; code: string }[];
  detail?: string;
};

export const extractError = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiError | undefined;
    if (data?.issues && data.issues.length > 0) {
      return data.issues.map((i) => `${i.path}: ${i.message}`).join('; ');
    }
    return data?.error ?? err.message;
  }
  if (err instanceof Error) return err.message;
  return 'Unknown error';
};
