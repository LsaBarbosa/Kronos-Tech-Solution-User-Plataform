import { api } from "@/config/api";
import { RecoverPasswordPayload, ResetPasswordPayload } from "@/types/auth";

export const fetchCurrentSession = async (): Promise<any> => {
  const { data } = await api.get("users/own-profile");
  return data;
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
