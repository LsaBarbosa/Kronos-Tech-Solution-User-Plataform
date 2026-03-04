import { api } from "@/config/api";
import { LoginResponse, RecoverPasswordPayload, ResetPasswordPayload } from "@/types/auth";
import type { UserAccountData } from "@/types/user";
import { fetchSessionProfile } from "@/service/session-profile.service";

export const fetchCurrentSession = async (): Promise<UserAccountData> => {
  const { account } = await fetchSessionProfile();
  return account;
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
