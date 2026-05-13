import { api } from "@/config/api";
import { API_ROUTES, buildRoute } from "@/config/api-routes";
import type { RecoverPasswordPayload, ResetPasswordPayload } from "@/types/auth";

export interface LoginPayload {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
}

export interface FaceLoginPayload {
    faceImageBase64: string;
    livenessPassed?: boolean;
}

/**
 * Autentica usuário e senha no backend e retorna o token de sessão.
 */
export const loginWithPassword = async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>(buildRoute(API_ROUTES.AUTH, "login"), payload);

    console.log("[auth.service] Login response:", { status: response.status, data: response.data });

    if (!response.data) {
        throw new Error("Resposta de login vazia do servidor.");
    }

    if (!response.data.token) {
        console.error("[auth.service] Token ausente na resposta. Response data:", response.data);
        throw new Error("Resposta de login sem token. Verifique se o backend está retornando o token corretamente.");
    }

    return response.data;
};

/**
 * Autentica por biometria facial e retorna o token de sessão.
 */
export const loginWithFace = async (payload: FaceLoginPayload): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>(buildRoute(API_ROUTES.AUTH, "login-face"), payload);

    console.log("[auth.service] Face login response:", { status: response.status, data: response.data });

    if (!response.data) {
        throw new Error("Resposta de login facial vazia do servidor.");
    }

    if (!response.data.token) {
        console.error("[auth.service] Token ausente na resposta facial. Response data:", response.data);
        throw new Error("Resposta de login facial sem token. Verifique se o backend está retornando o token corretamente.");
    }

    return response.data;
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
