import { api } from "@/config/api";
import { throwServiceError } from "@/service/helpers/service-error.helper";
import axios from "axios";

interface CompaniesResponse {
  companies: Array<{ id: string; name: string }>;
}

interface EmployeeCreateResponse {
  employeeId: string;
}

export interface CollaboratorCompanyItem {
  companyId: string;
  name: string;
}

export const fetchCollaboratorCompanies = async (): Promise<CollaboratorCompanyItem[]> => {
  try {
    const { data } = await api.get<CompaniesResponse>("companies");
    return (data.companies || []).map((company) => ({ companyId: company.id, name: company.name }));
  } catch (error) {
    throwServiceError(error, "Falha ao buscar a lista de empresas.");
  }
};

export const checkCpfExists = async (cpf: string): Promise<boolean> => {
  try {
    await api.get("employee/check-cpf", { params: { cpf } });
    return true;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return false;
    }

    throwServiceError(error, "Ocorreu um erro ao verificar o CPF.");
  }
};

export const checkUsernameExists = async (username: string): Promise<boolean> => {
  try {
    await api.get("users/check-username", { params: { username } });
    return true;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return false;
    }

    throwServiceError(error, "Ocorreu um erro ao verificar o nome de usuário.");
  }
};

export const createCollaboratorEmployee = async (payload: Record<string, unknown>): Promise<string> => {
  try {
    const { data } = await api.post<EmployeeCreateResponse>("employee", payload);
    return data.employeeId;
  } catch (error) {
    throwServiceError(error, "Desculpe. Verifique o campo CPF e tente novamente!");
  }
};

export const createCollaboratorUser = async (payload: Record<string, unknown>): Promise<void> => {
  try {
    await api.post("users", payload);
  } catch (error) {
    throwServiceError(error, "Falha ao criar o usuário.");
  }
};

export const updateOwnEmployeeProfile = async (payload: Record<string, unknown>): Promise<void> => {
  try {
    await api.patch("employee/update-own-profile", payload);
  } catch (error) {
    throwServiceError(error, "Falha ao atualizar o perfil.");
  }
};
