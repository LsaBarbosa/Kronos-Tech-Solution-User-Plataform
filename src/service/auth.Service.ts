import { api } from "@/config/api";
import { RecoverPasswordPayload, ResetPasswordPayload } from "@/types/auth";
import type { UserAccountData } from "@/types/user";

const normalizeSession = (data: any): UserAccountData => ({
  userId: data?.userId || data?.id || "",
  username: data?.username || data?.fullName || "",
  role: data?.role || "",
  active: Boolean(data?.active ?? true),
  employeeId: data?.employeeId || "",
  companyId: data?.companyId,
  claims: data?.claims,
});

export const fetchCurrentSession = async (): Promise<UserAccountData> => {
  try {
    const { data } = await api.get("auth/me");
    return normalizeSession(data);
  } catch {
    const { data } = await api.get("users/own-profile");
    return normalizeSession(data);
  }
};

export const logoutSession = async (): Promise<void> => {
  await api.post("auth/logout");
};

export const recoverPasswordRequest = async (payload: RecoverPasswordPayload): Promise<void> => {
  await api.post("auth/recover-password", payload);
};

export const resetPassword = async (payload: ResetPasswordPayload): Promise<void> => {
  await api.post("auth/reset-password", payload);
};
