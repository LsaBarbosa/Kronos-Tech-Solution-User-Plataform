import { api } from '@/config/api';
import { RecoverPasswordPayload, ResetPasswordPayload } from '@/types/auth';

export const recoverPasswordRequest = async (payload: RecoverPasswordPayload): Promise<void> => {
  await api.post('/auth/recover-password', payload);
};

export const resetPassword = async (payload: ResetPasswordPayload): Promise<void> => {
  await api.post('/auth/reset-password', {
    token: payload.passwordResetToken,
    newPassword: payload.newPassword,
    confirmPassword: payload.confirmPassword,
  });
};

/**
 * Encerra a sessão no backend.
 */
export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};
