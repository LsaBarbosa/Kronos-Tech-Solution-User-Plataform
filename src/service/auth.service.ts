import { api } from "@/config/api";
import { API_ROUTES, buildRoute } from "@/config/api-routes";
import type { RecoverPasswordPayload, ResetPasswordPayload } from "@/types/auth";

export interface LoginPayload {
    username: string;
    password: string;
}

export interface FaceLoginPayload {
    faceImageBase64: string;
    livenessPassed?: boolean;
}

/**
 * Autentica usuário e senha no backend.
 * O backend retorna 204 No Content com Set-Cookie header.
 */
export const loginWithPassword = async (payload: LoginPayload): Promise<void> => {
    const response = await api.post(buildRoute(API_ROUTES.AUTH, "login"), payload);
    // Resposta esperada: 204 No Content com Set-Cookie header
    if (response.status !== 204) {
        throw new Error("Login falhou. Resposta inesperada do servidor.");
    }
};

/**
 * Autentica por biometria facial.
 * O backend retorna 204 No Content com Set-Cookie header.
 */
export const loginWithFace = async (payload: FaceLoginPayload): Promise<void> => {
    const response = await api.post(buildRoute(API_ROUTES.AUTH, "login-face"), payload);
    // Resposta esperada: 204 No Content com Set-Cookie header
    if (response.status !== 204) {
        throw new Error("Login facial falhou. Resposta inesperada do servidor.");
    }
};

/**
 * Envia a solicitação para gerar o token de recuperação de senha.
 */
export const recoverPasswordRequest = async (payload: RecoverPasswordPayload): Promise<void> => {
    await api.post(buildRoute(API_ROUTES.AUTH, "recover-password"), payload);
};

/**
 * Redefine a senha utilizando o token recebido por e-mail.
 */
export const resetPassword = async (payload: ResetPasswordPayload): Promise<void> => {
    await api.post(buildRoute(API_ROUTES.AUTH, "reset-password"), payload);
};
