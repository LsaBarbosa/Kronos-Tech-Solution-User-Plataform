// src/services/userService.ts

import { apiFetch, parseApiResponse } from '@/config/api';
import { UserAccountData, UserData, ChangePasswordData, cleanNumberString } from '@/types/user';

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

export const listUsers = async (active: boolean | null): Promise<UserAccountData[]> => {
  let path = 'users/search';

  if (active !== null) {
    path = `${path}?active=${active ? 'true' : 'false'}`;
  }

  const response = await apiFetch(path);
  const data = await parseApiResponse<{ users: UserAccountData[] }>(response);
  return data.users;
};
