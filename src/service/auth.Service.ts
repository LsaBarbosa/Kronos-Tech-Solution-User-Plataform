import { api } from "@/config/api";
import { LoginResponse, RecoverPasswordPayload, ResetPasswordPayload } from "@/types/auth";
import type { UserAccountData } from "@/types/user";

interface OwnProfileResponse {
  userId: string;
  username?: string;
  fullName?: string;
  role: string;
  active?: boolean;
  employeeId: string;
  companyId?: string;
  claims?: Record<string, unknown>;
}

const normalizeSession = (data: OwnProfileResponse): UserAccountData => ({
  userId: data.userId,
  username: data.username ?? data.fullName ?? "",
  role: data.role,
  active: data.active ?? true,
  employeeId: data.employeeId,
  companyId: data.companyId,
  claims: data.claims,
});

export const fetchCurrentSession = async (): Promise<UserAccountData> => {
  const { data } = await api.get<OwnProfileResponse>("users/own-profile");
  return normalizeSession(data);
};

export const logoutSession = async (): Promise<void> => {
  await api.post("auth/logout");
};

export const loginWithPassword = async (username: string, password: string): Promise<LoginResponse> => {
  const { data } = await api.post("auth/login", { username, password });
  return data ?? {};
};

export const loginWithFace = async (faceImageBase64: string): Promise<LoginResponse> => {
  const { data } = await api.post("auth/login-face", { faceImageBase64 });
  return data ?? {};
};

export const recoverPasswordRequest = async (payload: RecoverPasswordPayload): Promise<void> => {
  await api.post("auth/recover-password", payload);
};

export const resetPassword = async (payload: ResetPasswordPayload): Promise<void> => {
  await api.post("auth/reset-password", payload);
};
