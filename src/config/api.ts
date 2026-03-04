import axios from 'axios';
import {
  API_ERROR_TYPE,
  ApiErrorPayload,
  buildTermsRedirectUrl,
  HTTP_STATUS,
} from '@/config/http-errors';

export const API_BASE_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data as ApiErrorPayload | undefined;

    if (status === HTTP_STATUS.UNAUTHORIZED) {
      localStorage.removeItem('token');
      localStorage.setItem('session_invalid', 'true');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }

      return Promise.reject(error);
    }

    if (status === HTTP_STATUS.FORBIDDEN && data?.type === API_ERROR_TYPE.TERMS_NOT_ACCEPTED && data.redirect_url) {
      window.location.href = buildTermsRedirectUrl(data.redirect_url, window.location.href);
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);
