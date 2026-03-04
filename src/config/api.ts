import axios from 'axios';
import {
  API_ERROR_TYPE,
  ApiErrorPayload,
  buildTermsRedirectUrl,
  HTTP_STATUS,
} from '@/config/http-errors';
import { queryClient } from '@/lib/queryClient';

const rawApiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/';

const ensureTrailingSlash = (value: string): string => (value.endsWith('/') ? value : `${value}/`);
const stripLeadingSlash = (value: string): string => value.replace(/^\/+/, '');
const isAbsoluteUrl = (value: string): boolean => /^https?:\/\//i.test(value);

export const API_BASE_URL = ensureTrailingSlash(rawApiBaseUrl);

const resolveApiUrl = (input: string | URL): string => {
  const value = input instanceof URL ? input.toString() : input;

  if (isAbsoluteUrl(value)) {
    return value;
  }

  return new URL(stripLeadingSlash(value), API_BASE_URL).toString();
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let hasUnauthorizedRedirect = false;

export const handleUnauthorized = (): void => {
  localStorage.setItem('session_invalid', 'true');
  queryClient.clear();

  if (hasUnauthorizedRedirect || window.location.pathname === '/login') {
    return;
  }

  hasUnauthorizedRedirect = true;
  window.location.assign('/login');
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data as ApiErrorPayload | undefined;

    if (status === HTTP_STATUS.UNAUTHORIZED) {
      handleUnauthorized();
      return Promise.reject(error);
    }

    if (
      status === HTTP_STATUS.FORBIDDEN
      && data?.type === API_ERROR_TYPE.TERMS_NOT_ACCEPTED
      && data.redirect_url
    ) {
      window.location.href = buildTermsRedirectUrl(data.redirect_url, window.location.href);
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

export const apiFetch = (input: string | URL, init: RequestInit = {}): Promise<Response> => {
  const url = resolveApiUrl(input);

  return fetch(url, {
    ...init,
    credentials: init.credentials ?? 'include',
  }).then((response) => {
    if (response.status === HTTP_STATUS.UNAUTHORIZED) {
      handleUnauthorized();
    }

    return response;
  });
};

const parseResponseBody = async (response: Response): Promise<unknown> => {
  if (response.status === HTTP_STATUS.NO_CONTENT) {
    return undefined;
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text.length ? text : undefined;
};

export const parseApiResponse = async <T>(response: Response): Promise<T> => {
  const payload = (await parseResponseBody(response)) as ApiErrorPayload | T | undefined;

  if (!response.ok) {
    if (response.status === HTTP_STATUS.UNAUTHORIZED) {
      handleUnauthorized();
    }

    if (
      response.status === HTTP_STATUS.FORBIDDEN
      && typeof payload === 'object'
      && payload !== null
      && 'type' in payload
      && 'redirect_url' in payload
      && payload.type === API_ERROR_TYPE.TERMS_NOT_ACCEPTED
      && payload.redirect_url
    ) {
      window.location.href = buildTermsRedirectUrl(String(payload.redirect_url), window.location.href);
    }

    const detail =
      typeof payload === 'object' && payload !== null
        ? (payload as Record<string, unknown>).detail || (payload as Record<string, unknown>).message
        : undefined;

    const message = typeof detail === 'string' ? detail : `Erro de API (${response.status})`;
    const error = new Error(message) as Error & { status: number; data: unknown };
    error.status = response.status;
    error.data = payload;

    throw error;
  }

  return payload as T;
};
