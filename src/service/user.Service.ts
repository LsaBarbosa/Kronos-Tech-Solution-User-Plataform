import { api } from "@/config/api";
import { throwServiceError } from "@/service/helpers/service-error.helper";
import { mapUserAccount, mapUserProfile, unwrapList } from "@/service/helpers/response-normalizer.helper";
import { fetchSessionProfile } from "@/service/session-profile.service";
import { UserAccountData, UserData, ChangePasswordData, cleanNumberString } from "@/types/user";

export const fetchCurrentUserData = fetchSessionProfile;

export const fetchAccountData = async (): Promise<UserAccountData> => {
  try {
    const { data } = await api.get("users/own-profile");
    return mapUserAccount(data);
  } catch (error) {
    throwServiceError(error, "Não foi possível buscar os dados da conta.");
  }
};

export const fetchUserData = async (_employeeId: string): Promise<UserData> => {
  try {
    const { data } = await api.get("employee/own-profile");
    return mapUserProfile(data);
  } catch (error) {
    throwServiceError(error, "Não foi possível buscar os dados do usuário.");
  }
};

export const updateEmail = async (_employeeId: string, newEmail: string): Promise<void> => {
  try {
    await api.patch("employee/update-own-profile", { email: newEmail });
  } catch (error) {
    throwServiceError(error, "Não foi possível atualizar o e-mail.");
  }
};

export const updatePhone = async (_employeeId: string, newPhone: string): Promise<void> => {
  try {
    await api.patch("employee/update-own-profile", { phone: cleanNumberString(newPhone) });
  } catch (error) {
    throwServiceError(error, "Não foi possível atualizar o telefone.");
  }
};

export const changePassword = async (data: ChangePasswordData): Promise<void> => {
  if (data.newPassword !== data.confirmPassword) {
    throw new Error("As novas senhas não coincidem.");
  }

  try {
    await api.put("users/password", {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });
  } catch (error) {
    throwServiceError(error, "Não foi possível alterar a senha.");
  }
};

export const listUsers = async (active: boolean | null): Promise<UserAccountData[]> => {
  try {
    const params = active === null ? undefined : { active };
    const { data } = await api.get("users/search", { params });
    const users = unwrapList(data, ["users", "employees"], "Listagem de usuários");
    return users.map((user) => mapUserAccount(user));
  } catch (error) {
    throwServiceError(error, "Não foi possível listar usuários.");
  }
};
