import { apiFetch, parseApiResponse } from '@/config/api';

export type SessionRole = 'PARTNER' | 'MANAGER' | 'CTO' | 'ADMIN' | 'USER' | string;

export interface AccountProfileResponse {
  employeeId: string;
  role: SessionRole;
  username?: string;
}

export interface EmployeeProfileResponse {
  employeeId: string;
  fullName: string;
  email?: string;
}

export interface SessionProfileResponse {
  account: AccountProfileResponse;
  employeeProfile: EmployeeProfileResponse;
}

export interface SessionUserResponse {
  employeeId: string;
  role: SessionRole;
  fullName: string;
  username?: string;
  email?: string;
}

export const fetchSessionProfile = async (): Promise<SessionProfileResponse> => {
  const accountResponse = await apiFetch('users/own-profile', { method: 'GET' });
  const account = await parseApiResponse<AccountProfileResponse>(accountResponse);

  const employeeResponse = await apiFetch('employee/own-profile', { method: 'GET' });
  const employeeProfile = await parseApiResponse<EmployeeProfileResponse>(employeeResponse);

  return {
    account,
    employeeProfile,
  };
};

export const fetchSessionUser = async (): Promise<SessionUserResponse> => {
  const { account, employeeProfile } = await fetchSessionProfile();

  return {
    employeeId: account.employeeId || employeeProfile.employeeId,
    role: account.role,
    fullName: employeeProfile.fullName || account.username || '',
    username: account.username,
    email: employeeProfile.email,
  };
};
