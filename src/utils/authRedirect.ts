import { clearLocalAuthSession } from '@/lib/auth-session';

const LOGIN_PATH = '/login';

export const redirectToLogin = (): void => {
  clearLocalAuthSession();

  if (window.location.pathname !== LOGIN_PATH) {
    window.location.href = LOGIN_PATH;
  }
};
