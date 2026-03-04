// src/services/employeeService.ts

import { EmployeeCreationPayload, CompanyListItem, EmployeeData, cleanNumberString } from '@/types/employee';
import { apiFetch, parseApiResponse } from '@/config/api';

export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  if (username.length < 5) return false;

  const response = await apiFetch(`auth/username-availability?username=${username}`);
  if (!response.ok) return false;

  const data = await response.json();
  return data.available;
};

export const fetchCompanyList = async (): Promise<CompanyListItem[]> => {
  const response = await apiFetch('companies/list-basic');
  const data = await parseApiResponse<any[]>(response);
  return data.map((item: any) => ({ companyId: item.id, name: item.name }));
};

const createApiPayload = (formData: EmployeeCreationPayload): Omit<EmployeeCreationPayload, 'confirmPassword'> => ({
  ...formData,
  homeOffice: formData.homeOffice,
  cpf: cleanNumberString(formData.cpf),
  pis: cleanNumberString(formData.pis),
  phoneNumber: cleanNumberString(formData.phoneNumber),
  salary: Number(formData.salary),
});

export const createPartner = async (formData: EmployeeCreationPayload): Promise<void> => {
  const finalPayload = createApiPayload(formData);
  (finalPayload as any).role = 'PARTNER';

  const response = await apiFetch('employees/create-partner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(finalPayload),
  });
  await parseApiResponse(response);
};

export const createManager = async (formData: EmployeeCreationPayload): Promise<void> => {
  const finalPayload = createApiPayload(formData);
  (finalPayload as any).role = 'MANAGER';

  const response = await apiFetch('employees/create-manager', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(finalPayload),
  });
  await parseApiResponse(response);
};

export const fetchEmployeeList = async (): Promise<EmployeeData[]> => {
  const response = await apiFetch('employee');
  const data = await parseApiResponse<{ employees: EmployeeData[] }>(response);
  return data.employees;
};

export const toggleEmployeeStatus = async (employeeId: string, currentStatus: boolean): Promise<void> => {
  const response = await apiFetch(`employees/${employeeId}/toggle-status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ active: !currentStatus }),
  });
  await parseApiResponse(response);
};

export const deleteEmployee = async (employeeId: string): Promise<void> => {
  const response = await apiFetch(`employees/${employeeId}`, { method: 'DELETE' });
  await parseApiResponse(response);
};
