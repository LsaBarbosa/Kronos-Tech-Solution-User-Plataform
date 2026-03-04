// src/services/messageService.ts

import { apiFetch, parseApiResponse } from '@/config/api';
import { Message, MessagePayload } from '@/types/message';
import { EmployeeData } from '@/types/employee';

const decodeToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(payload);
  } catch (error) {
    console.error('Falha ao decodificar o token', error);
    return null;
  }
};

export const fetchMessages = async (): Promise<Message[]> => {
  const response = await apiFetch('messages', { method: 'GET' });
  return parseApiResponse(response);
};

export const deleteMessage = async (messageId: string): Promise<void> => {
  const response = await apiFetch(`messages/${messageId}`, { method: 'DELETE' });
  await parseApiResponse(response);
};

export const postMessage = async (payload: MessagePayload): Promise<void> => {
  const response = await apiFetch('messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  await parseApiResponse(response);
};

export const fetchActiveEmployees = async (): Promise<EmployeeData[]> => {
  const response = await apiFetch('employee?active=true');
  const data = await parseApiResponse<{ employees: any[] }>(response);

  return data.employees.map((emp: any) => ({
    employeeId: emp.employeeId,
    fullName: emp.fullName,
  })) as EmployeeData[];
};

export const getUserRoleFromToken = (): 'MANAGER' | 'PARTNER' | 'CTO' | '' => {
  const token = localStorage.getItem('token');
  if (!token) return '';

  const decoded = decodeToken(token);
  const role = decoded?.role;

  if (role === 'MANAGER' || role === 'PARTNER' || role === 'CTO') {
    return role;
  }
  return '';
};
