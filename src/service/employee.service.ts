import {
  checkCpfAvailability,
  createCollaborator,
  fetchEmployeeList,
  updateCollaborator,
  type CollaboratorCreationPayload,
  type CollaboratorCreationResponse,
} from "@/service/collaborator-management.service";
import { api } from "@/config/api";
import { API_ROUTES, buildRoute } from "@/config/api-routes";
import { extractObject } from "@/service/helpers/response-normalizer.helper";
import type { EmployeeData } from "@/types/employee";

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

export type EmployeeCreationPayload = CollaboratorCreationPayload;
export type EmployeeCreationResponse = CollaboratorCreationResponse;
