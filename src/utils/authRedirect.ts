import { handleUnauthorized } from '@/config/api';
import { clearLocalAuthSession } from '@/lib/auth-session';

export const redirectToLogin = (): void => {
  clearLocalAuthSession();
  handleUnauthorized();
};
