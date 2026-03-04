// src/services/authService.ts

import { apiFetch, parseApiResponse } from '@/config/api';
import { RecoverPasswordPayload, ResetPasswordPayload } from '@/types/auth';

export const recoverPasswordRequest = async (payload: RecoverPasswordPayload): Promise<void> => {
  const response = await apiFetch('auth/recover-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  await parseApiResponse(response);
};

export const resetPassword = async (payload: ResetPasswordPayload): Promise<void> => {
  const response = await apiFetch('auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  await parseApiResponse(response);
};
