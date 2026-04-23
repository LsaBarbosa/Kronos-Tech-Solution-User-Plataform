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
  password?: string;
}

export interface UserUpdatePayload {
  username?: string;
  password?: string;
  role?: "MANAGER" | "PARTNER";
  enabled?: boolean;
}

export interface ManagerCreationPayload {
  companyId: string;
  fullName: string;
  cpf: string;
  jobPosition: string;
  email: string;
  salary: number;
  phone: string;
  address: CollaboratorAddressPayload;
  scheduleType: string;
  scaleStartDate: string | null;
  preferredDayOff: string | null;
  weekendOffIndex: number | null;
  fixedWorkDays: string[];
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

export const createManager = async (
  payload: ManagerCreationPayload
): Promise<CollaboratorCreationResponse> => {
  const response = await api.post<CollaboratorCreationResponse>(`/${API_ROUTES.EMPLOYEE}`, payload);
  const data = extractObject<CollaboratorCreationResponse>(response.data) as CollaboratorCreationResponse;

  if (!data.employeeId) {
    throw new Error("Resposta de criação de colaborador sem employeeId.");
  }

  return data;
};

export const fetchCompanyList = async (): Promise<CompanyListItem[]> => {
  const response = await api.get<{ companies?: Array<{ id?: string; companyId?: string; name?: string }> }>(`/${API_ROUTES.COMPANIES}`);
  const companies = extractArray<{ id?: string; companyId?: string; name?: string }>(response.data, ["companies"]);

  return companies.map((company) => ({
    companyId: company.companyId ?? company.id ?? "",
    name: company.name ?? "",
  }));
};

export const fetchEmployeeList = async (active: boolean | null = true): Promise<EmployeeData[]> => {
  const response = await api.get<{ employees?: EmployeeData[] }>(`/${API_ROUTES.EMPLOYEE}`, {
    params: active !== null ? { active } : undefined,
  });
  return extractArray<EmployeeData>(response.data, ["employees"]);
};

export const updateCollaborator = async (
  employeeId: string,
  payload: Record<string, unknown>
): Promise<void> => {
  await api.patch(buildRoute(API_ROUTES.EMPLOYEE, "manager", "update-employee", employeeId), payload);
};

export const updateUser = async (
  userId: string,
  payload: UserUpdatePayload
): Promise<void> => {
  await api.patch(buildRoute(API_ROUTES.USERS, "search", userId), payload);
};

export const toggleUserStatus = async (
  userId: string,
  currentStatus: boolean
): Promise<void> => {
  await api.patch(buildRoute(API_ROUTES.USERS, "toggle-activate", userId), {
    active: !currentStatus,
  });
};
