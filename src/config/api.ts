import axios, { AxiosError } from 'axios';
import { PUBLIC_ROUTES } from './routes';

export const API_BASE_URL = import.meta.env.VITE_API_URL;

const redirectToTerms = (redirectBaseUrl: string) => {
  const currentPlatformUrl = window.location.href;
  const finalRedirectUrl = `${redirectBaseUrl}?returnUrl=${encodeURIComponent(currentPlatformUrl)}`;
  window.location.href = finalRedirectUrl;
};

const redirectToLogin = () => {
  if (window.location.pathname !== PUBLIC_ROUTES.LOGIN) {
    window.location.href = PUBLIC_ROUTES.LOGIN;
  }
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 403 && data?.type === 'TERMS_NOT_ACCEPTED' && data?.redirect_url) {
      redirectToTerms(data.redirect_url);
      return Promise.reject(error);
    }

    if (status === 401 || status === 403) {
      redirectToLogin();
    }

    return Promise.reject(error);
  }
);
