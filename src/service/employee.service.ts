import { apiFetch, parseApiResponse } from '@/config/api';

export interface EmployeeSummary {
  employeeId: string;
  fullName: string;
}

export interface EmployeeSearchItem {
  employeeId: string;
  fullName: string;
  maskedCpf: string;
  pis: string;
  jobPosition: string;
  email: string;
  salary: number;
  phone: string;
  address: {
    street: string;
    number: string;
    postalCode: string;
    city: string;
    state: string;
  };
  companyId: string;
  active: boolean;
  homeOffice: boolean;
  workStartTime?: string;
  workEndTime?: string;
  breakStartTime?: string;
  breakEndTime?: string;
  scheduleType?: string;
  scaleStartDate?: string;
  preferredDayOff?: string;
  weekendOffIndex?: number;
  fixedWorkDays?: string[];
}

export const checkCpfStatus = async (cpf: string): Promise<'available' | 'unavailable' | 'unknown'> => {
  const response = await apiFetch(`employee/check-cpf?cpf=${encodeURIComponent(cpf)}`, {
    credentials: 'include',
  });

  if (response.ok) return 'unavailable';
  if (response.status === 404) return 'available';

  return 'unknown';
};

export const createEmployee = async (payload: Record<string, unknown>): Promise<{ employeeId: string }> => {
  const response = await apiFetch('employee', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  return parseApiResponse<{ employeeId: string }>(response);
};

export const listEmployees = async (active?: boolean): Promise<EmployeeSearchItem[]> => {
  const query = typeof active === 'boolean' ? `?active=${active}` : '';
  const response = await apiFetch(`employee${query}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  const data = await parseApiResponse<{ employees: EmployeeSearchItem[] }>(response);
  return data.employees ?? [];
};

export const updateEmployeeByManager = async (
  employeeId: string,
  payload: Record<string, unknown>,
): Promise<void> => {
  const response = await apiFetch(`employee/manager/update-employee/${employeeId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  await parseApiResponse(response);
};
