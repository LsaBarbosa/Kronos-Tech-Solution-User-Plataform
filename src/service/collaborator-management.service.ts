import { api } from "@/config/api";
import { normalizeServiceError } from "@/service/helpers/service-error.helper";
import { extractObject } from "@/service/helpers/response-normalizer.helper";

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
  checkAvailabilityByStatus("/employee/check-cpf", "cpf", cpf);

export const checkUsernameAvailability = async (
  username: string
): Promise<boolean> => checkAvailabilityByStatus("/users/check-username", "username", username);

export const createCollaborator = async (
  payload: CollaboratorCreationPayload
): Promise<CollaboratorCreationResponse> => {
  const response = await api.post<CollaboratorCreationResponse>("/employee", payload);
  const data = extractObject<CollaboratorCreationResponse>(response.data) as CollaboratorCreationResponse;

  if (!data.employeeId) {
    throw new Error("Resposta de criação de colaborador sem employeeId.");
  }

  return data;
};

export const createUser = async (payload: UserCreationPayload): Promise<void> => {
  await api.post("/users", payload);
};
