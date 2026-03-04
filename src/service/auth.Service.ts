import { api } from "@/config/api";
import { throwServiceError } from "@/service/helpers/service-error.helper";
import { mapSession, unwrapObject } from "@/service/helpers/response-normalizer.helper";
import { LoginResponse, RecoverPasswordPayload, ResetPasswordPayload } from "@/types/auth";
import type { UserAccountData } from "@/types/user";
import { fetchSessionProfile } from "@/service/session-profile.service";

export const fetchCurrentSession = async (): Promise<UserAccountData> => {
  const { account } = await fetchSessionProfile();
  return account;
};

export const logoutSession = async (): Promise<void> => {
  try {
    await api.post("auth/logout");
  } catch (error) {
    throwServiceError(error, "Não foi possível encerrar a sessão.");
  }
};

export const loginWithPassword = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    const { data } = await api.post("auth/login", { username, password });
    return unwrapObject(data ?? {}, "Login com senha") as LoginResponse;
  } catch (error) {
    throwServiceError(error, "Falha ao realizar login com senha.");
  }
};

export const loginWithFace = async (faceImageBase64: string): Promise<LoginResponse> => {
  try {
    const { data } = await api.post("auth/login-face", { faceImageBase64 });
    return unwrapObject(data ?? {}, "Login facial") as LoginResponse;
  } catch (error) {
    throwServiceError(error, "Falha ao realizar login facial.");
  }
};

export const recoverPasswordRequest = async (payload: RecoverPasswordPayload): Promise<void> => {
  try {
    await api.post("auth/recover-password", payload);
  } catch (error) {
    throwServiceError(error, "Não foi possível solicitar recuperação de senha.");
  }
};

export const resetPassword = async (payload: ResetPasswordPayload): Promise<void> => {
  try {
    await api.post("auth/reset-password", payload);
  } catch (error) {
    throwServiceError(error, "Não foi possível redefinir a senha.");
  }
};
