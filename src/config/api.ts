import axios from 'axios';
import { getStoredToken } from '@/lib/auth';
import { reportError } from '@/lib/observability';

export const API_BASE_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    reportError(error, { feature: 'http', action: 'request-interceptor' });
    return Promise.reject(error);
  }
);

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
