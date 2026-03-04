import { api } from "@/config/api";

export const fetchCompanies = async () => {
  const { data } = await api.get("companies");
  return data.companies as Array<{ id: string; name: string }>;
};

export const checkCpfExists = async (cpf: string): Promise<boolean> => {
  try {
    await api.get("employee/check-cpf", { params: { cpf } });
    return true;
  } catch (error: any) {
    if (error?.response?.status === 404) return false;
    throw error;
  }
};

export const checkUsernameExists = async (username: string): Promise<boolean> => {
  try {
    await api.get("users/check-username", { params: { username } });
    return true;
  } catch (error: any) {
    if (error?.response?.status === 404) return false;
    throw error;
  }
};

export const createEmployee = async (payload: any) => {
  const { data } = await api.post("employee", payload);
  return data;
};

export const createUser = async (payload: any) => {
  const { data } = await api.post("users", payload);
  return data;
};

export const fetchEmployeesByActive = async (active: boolean) => {
  const { data } = await api.get("employee", { params: { active } });
  return data.employees || [];
};

export const fetchUsersSearch = async () => {
  const { data } = await api.get("users/search");
  return data.users || [];
};

export const updateManagedEmployee = async (colaboradorId: string, payload: any) => {
  await api.patch(`employee/manager/update-employee/${colaboradorId}`, payload);
};

export const updateUserById = async (userId: string, payload: any) => {
  await api.patch(`users/search/${userId}`, payload);
};

export const toggleUserActivation = async (userId: string) => {
  await api.patch(`users/toggle-activate/${userId}`);
};

export const checkCnpjExists = async (cnpj: string): Promise<boolean> => {
  try {
    await api.get("companies/check-cnpj", { params: { cnpj } });
    return true;
  } catch (error: any) {
    if (error?.response?.status === 404) return false;
    throw error;
  }
};

export const createCompany = async (payload: any) => {
  const { data } = await api.post("companies", payload);
  return data;
};
