import { apiFetch, parseApiResponse } from '@/config/api';

export interface UserSummary {
  userId: string;
  username: string;
  role: 'MANAGER' | 'PARTNER';
  active: boolean;
  employeeId: string;
}

export const checkUsernameStatus = async (
  username: string,
): Promise<'available' | 'unavailable' | 'unknown'> => {
  const response = await apiFetch(`users/check-username?username=${encodeURIComponent(username)}`, {
    credentials: 'include',
  });

  if (response.ok) return 'unavailable';
  if (response.status === 404) return 'available';

  return 'unknown';
};

export const createUser = async (payload: {
  username?: string;
  password?: string;
  role?: 'MANAGER' | 'PARTNER';
  employeeId: string;
}): Promise<void> => {
  const response = await apiFetch('users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  await parseApiResponse(response);
};

export const listUsers = async (): Promise<UserSummary[]> => {
  const response = await apiFetch('users/search', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  const data = await parseApiResponse<{ users: UserSummary[] }>(response);
  return data.users ?? [];
};

export const updateUserById = async (userId: string, payload: Record<string, unknown>): Promise<void> => {
  const response = await apiFetch(`users/search/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  await parseApiResponse(response);
};

export const toggleUserActive = async (userId: string): Promise<void> => {
  const response = await apiFetch(`users/toggle-activate/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  });

  await parseApiResponse(response);
};
