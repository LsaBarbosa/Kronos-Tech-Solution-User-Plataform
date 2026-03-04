import { apiFetch, parseApiResponse } from '@/config/api';
import { EmployeeCreationPayload, CompanyListItem, EmployeeData, cleanNumberString } from '@/types/employee';

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

export const listEmployeesByStatus = async (active: string | boolean): Promise<EmployeeSummary[]> => {
  const normalizedActive = typeof active === 'boolean' ? active : active === 'true';
  const employees = await listEmployees(normalizedActive);

  return employees.map((employee) => ({
    employeeId: employee.employeeId,
    fullName: employee.fullName,
  }));
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


// Legacy compatibility: consolidated from employee.Service.ts
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  if (username.length < 5) return false;

  const response = await apiFetch(`auth/username-availability?username=${username}`);
  if (!response.ok) return false;

  const data = await response.json();
  return data.available;
};

export const fetchCompanyList = async (): Promise<CompanyListItem[]> => {
  const response = await apiFetch('companies/list-basic');
  const data = await parseApiResponse<Array<{ id: string; name: string }>>(response);
  return data.map((item) => ({ companyId: item.id, name: item.name }));
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
  const finalPayload = { ...createApiPayload(formData), role: 'PARTNER' as const };

  const response = await apiFetch('employees/create-partner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(finalPayload),
  });
  await parseApiResponse(response);
};

export const createManager = async (formData: EmployeeCreationPayload): Promise<void> => {
  const finalPayload = { ...createApiPayload(formData), role: 'MANAGER' as const };

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
