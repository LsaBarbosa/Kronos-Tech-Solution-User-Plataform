import { apiFetch, parseApiResponse } from '@/config/api';
import { ChangePasswordData, UserAccountData, UserData, cleanNumberString } from '@/types/user';

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



export const listUsersByActive = async (active: boolean | null): Promise<UserAccountData[]> => {
  let path = 'users/search';

  if (active !== null) {
    path = `${path}?active=${active ? 'true' : 'false'}`;
  }

  const response = await apiFetch(path);
  const data = await parseApiResponse<{ users: UserAccountData[] }>(response);
  return data.users;
};

// Legacy compatibility: consolidated from user.Service.ts
export const fetchAccountData = async (): Promise<UserAccountData> => {
  const response = await apiFetch('users/own-profile');
  return parseApiResponse(response);
};

export const fetchUserData = async (_employeeId: string): Promise<UserData> => {
  const response = await apiFetch('employee/own-profile');
  return parseApiResponse(response);
};

export const updateEmail = async (_employeeId: string, newEmail: string): Promise<void> => {
  const response = await apiFetch('employee/update-own-profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: newEmail }),
  });

  await parseApiResponse(response);
};

export const updatePhone = async (_employeeId: string, newPhone: string): Promise<void> => {
  const response = await apiFetch('employee/update-own-profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: cleanNumberString(newPhone) }),
  });

  await parseApiResponse(response);
};

export const changePassword = async (data: ChangePasswordData): Promise<void> => {
  if (data.newPassword !== data.confirmPassword) {
    throw new Error('As novas senhas não coincidem.');
  }

  const response = await apiFetch('users/password', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    }),
  });

  await parseApiResponse(response);
};
