import { api } from "@/config/api";
import { API_ROUTES, buildRoute } from "@/config/api-routes";
import { normalizeServiceError } from "@/service/helpers/service-error.helper";
import { extractArray, extractObject } from "@/service/helpers/response-normalizer.helper";
import { CompanyListItem, EmployeeData } from "@/types/employee";

export interface CollaboratorAddressPayload {
  postalCode: string;
  number: string;
}

export interface CollaboratorCreationPayload {
  fullName: string;
  cpf: string;
  jobPosition: string;
  email: string;
  salary: number;
  phone: string;
  homeOffice: boolean;
  faceImageBase64?: string;
  address: CollaboratorAddressPayload;
  workStartTime: string;
  workEndTime: string;
  breakStartTime: string;
  breakEndTime: string;
  scheduleType: string;
  scaleStartDate: string | null;
  preferredDayOff: string | null;
  weekendOffIndex: number | null;
  fixedWorkDays: string[];
}

export interface CollaboratorCreationResponse {
  employeeId: string;
}

export interface UserCreationPayload {
  username: string;
  role: "MANAGER" | "PARTNER";
  employeeId: string;
}

const checkAvailabilityByStatus = async (
  path: string,
  paramName: string,
  value: string
): Promise<boolean> => {
  try {
    await api.get(path, {
      params: { [paramName]: value },
    });
    return false;
  } catch (error) {
    const normalized = normalizeServiceError(error);

    if (normalized.status === 404) {
      return true;
    }

    throw normalized;
  }
};

export const checkCpfAvailability = async (cpf: string): Promise<boolean> =>
  checkAvailabilityByStatus(buildRoute(API_ROUTES.EMPLOYEE, "check-cpf"), "cpf", cpf);

export const checkUsernameAvailability = async (
  username: string
): Promise<boolean> => checkAvailabilityByStatus(buildRoute(API_ROUTES.USERS, "check-username"), "username", username);

export const createCollaborator = async (
  payload: CollaboratorCreationPayload
): Promise<CollaboratorCreationResponse> => {
  const response = await api.post<CollaboratorCreationResponse>(`/${API_ROUTES.EMPLOYEE}`, payload);
  const data = extractObject<CollaboratorCreationResponse>(response.data) as CollaboratorCreationResponse;

  if (!data.employeeId) {
    throw new Error("Resposta de criação de colaborador sem employeeId.");
  }

  return data;
};

export const createUser = async (payload: UserCreationPayload): Promise<void> => {
  await api.post(`/${API_ROUTES.USERS}`, payload);
};

export const fetchCompanyList = async (): Promise<CompanyListItem[]> => {
  const response = await api.get<{ companies?: Array<{ id?: string; companyId?: string; name?: string }> }>(`/${API_ROUTES.COMPANIES}`);
  const companies = extractArray<{ id?: string; companyId?: string; name?: string }>(response.data, ["companies"]);

  return companies.map((company) => ({
    companyId: company.companyId ?? company.id ?? "",
    name: company.name ?? "",
  }));
};

export const fetchEmployeeList = async (): Promise<EmployeeData[]> => {
  const response = await api.get<{ employees?: EmployeeData[] }>(`/${API_ROUTES.EMPLOYEE}`);
  return extractArray<EmployeeData>(response.data, ["employees"]);
};

export const toggleEmployeeStatus = async (
  employeeId: string,
  currentStatus: boolean
): Promise<void> => {
  await api.patch(buildRoute(API_ROUTES.EMPLOYEES, employeeId, "toggle-status"), {
    active: !currentStatus,
  });
};

export const deleteEmployee = async (employeeId: string): Promise<void> => {
  await api.delete(buildRoute(API_ROUTES.EMPLOYEES, employeeId));
};
