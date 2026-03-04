import { api } from "@/config/api";
import { UserAccountData, UserData, ChangePasswordData, cleanNumberString } from "@/types/user";

export const fetchAccountData = async (): Promise<UserAccountData> => {
  const { data } = await api.get("users/own-profile");
  return data;
};

export const fetchUserData = async (_employeeId: string): Promise<UserData> => {
  const { data } = await api.get("employee/own-profile");
  return data;
};

export const updateEmail = async (_employeeId: string, newEmail: string): Promise<void> => {
  await api.patch("employee/update-own-profile", { email: newEmail });
};

export const updatePhone = async (_employeeId: string, newPhone: string): Promise<void> => {
  await api.patch("employee/update-own-profile", { phone: cleanNumberString(newPhone) });
};

export const changePassword = async (data: ChangePasswordData): Promise<void> => {
  if (data.newPassword !== data.confirmPassword) {
    throw new Error("As novas senhas não coincidem.");
  }

  await api.put("users/password", {
    currentPassword: data.currentPassword,
    newPassword: data.newPassword,
    confirmPassword: data.confirmPassword,
  });
};

export const listUsers = async (active: boolean | null): Promise<UserAccountData[]> => {
  const params = active === null ? undefined : { active };
  const { data } = await api.get("users/search", { params });
  return data.users as UserAccountData[];
};
