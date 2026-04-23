import { api } from "@/config/api";
import { API_ROUTES, buildRoute } from "@/config/api-routes";
import { RecoverPasswordPayload, ResetPasswordPayload } from "@/types/auth";

export interface LoginPayload {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
}

export interface FaceLoginPayload {
    faceImageBase64: string;
}

/**
 * Autentica usuário e senha no backend e retorna o token de sessão.
 */
export const loginWithPassword = async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>(buildRoute(API_ROUTES.AUTH, "login"), payload);

    if (!response.data?.token) {
        throw new Error("Resposta de login sem token.");
    }

    return response.data;
};

/**
 * Autentica por biometria facial e retorna o token de sessão.
 */
export const loginWithFace = async (payload: FaceLoginPayload): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>(buildRoute(API_ROUTES.AUTH, "login-face"), payload);

    if (!response.data?.token) {
        throw new Error("Resposta de login facial sem token.");
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
