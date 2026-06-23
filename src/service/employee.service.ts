import {
  checkCpfAvailability,
  createCollaborator,
  fetchEmployeeList,
  updateCollaborator,
  type CollaboratorCreationPayload,
  type CollaboratorCreationResponse,
} from "@/service/collaborator-management.service";
import { api } from "@/config/api";
import { API_ROUTES, EMPLOYEE_PATHS, buildRoute } from "@/config/api-routes";
import { normalizeServiceError } from "@/service/helpers/service-error.helper";
import { extractObject } from "@/service/helpers/response-normalizer.helper";
import type { EmployeeData } from "@/types/employee";

export interface EmployeeListItem {
  employeeId: string;
  fullName: string;
  maskedCpf: string;
  jobPosition: string;
  active: boolean;
  companyName: string;
}

export interface EmployeeDetail {
  employeeId: string;
  fullName: string;
  maskedCpf: string;
  jobPosition: string;
  email: string;
  salary: number;
  phone: string;
  address: { street: string; number: string; postalCode: string; city: string; state: string };
  companyName: string;
  homeOffice: boolean;
  workStartTime: string | null;
  workEndTime: string | null;
  breakStartTime: string | null;
  breakEndTime: string | null;
  scheduleType: string | null;
  scaleStartDate: string | null;
  preferredDayOff: string | null;
  weekendOffIndex: number | null;
  fixedWorkDays: string[];
}

export const findEmployeeByCpf = async (cpf: string): Promise<EmployeeDetail | null> => {
  try {
    const response = await api.get<EmployeeDetail>(
      buildRoute(API_ROUTES.EMPLOYEE, EMPLOYEE_PATHS.FIND_BY_CPF),
      { params: { cpf } }
    );
    return response.data ?? null;
  } catch (error) {
    const normalized = normalizeServiceError(error);
    if (normalized.status === 404) return null;
    throw normalized;
  }
};

export const listEmployeesByCompany = async (
  companyId: string,
  active?: boolean
): Promise<EmployeeListItem[]> => {
  const response = await api.get<{ employees: EmployeeListItem[] }>(
    buildRoute(API_ROUTES.EMPLOYEE, EMPLOYEE_PATHS.BY_COMPANY(companyId)),
    active !== undefined ? { params: { active } } : undefined
  );
  return Array.isArray(response.data?.employees) ? response.data.employees : [];
};

export const checkCpf = checkCpfAvailability;
export const createEmployee = createCollaborator;
export const listEmployees = fetchEmployeeList;
export const updateEmployee = updateCollaborator;

export const getEmployee = async (employeeId: string): Promise<EmployeeData> => {
  const response = await api.get<EmployeeData>(buildRoute(API_ROUTES.EMPLOYEE, employeeId));
  return extractObject<EmployeeData>(response.data) as EmployeeData;
};

export const deleteEmployee = async (employeeId: string): Promise<void> => {
  await api.delete(buildRoute(API_ROUTES.EMPLOYEE, employeeId));
};

interface BiometricEnrollmentRequest {
  faceImageBase64: string;
  livenessPassed?: boolean;
}

export const enrollBiometricByManager = async (
  employeeId: string,
  request: BiometricEnrollmentRequest
): Promise<void> => {
  await api.post(`${API_ROUTES.EMPLOYEE}/manager/${employeeId}/biometric-enrollment`, request);
};

export type EmployeeCreationPayload = CollaboratorCreationPayload;
export type EmployeeCreationResponse = CollaboratorCreationResponse;
