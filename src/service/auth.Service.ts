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
    const response = await fetch(`${API_BASE_URL}auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    // Se a API retornar sucesso (200/204), a função passa.
    await handleResponse(response);
};

/**
 * Encerra a sessão no backend.
 */
export const logout = async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}auth/logout`, {
        method: 'POST',
        credentials: 'include',
    });

    await handleResponse(response);
};
