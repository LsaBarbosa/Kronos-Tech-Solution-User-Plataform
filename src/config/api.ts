import axios from 'axios';
import { reportError } from '@/lib/observability';

export const API_BASE_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  config.withCredentials = true;

  if (config.headers) {
    const authorization = config.headers.Authorization ?? config.headers.authorization;

    if (typeof authorization === 'string' && authorization.trim().toLowerCase().startsWith('bearer')) {
      delete config.headers.Authorization;
      delete config.headers.authorization;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const correlationId = error?.response?.headers?.['x-correlation-id'];

    if (error.response) {
      const { status, data } = error.response;

      if (status === 403 && data?.type === 'TERMS_NOT_ACCEPTED') {
        const redirectBaseUrl = data.redirect_url;
        const currentPlatformUrl = window.location.href;
        const finalRedirectUrl = `${redirectBaseUrl}?returnUrl=${encodeURIComponent(currentPlatformUrl)}`;
        window.location.href = finalRedirectUrl;
      }
    }

    reportError(error, {
      feature: 'http',
      action: 'response-interceptor',
      correlationId,
      status: error?.response?.status,
      url: error?.config?.url,
      method: error?.config?.method,
    });

    return Promise.reject(error);
  }
);
