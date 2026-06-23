import { api } from "@/config/api";
import { API_ROUTES, AUTH_PATHS, buildRoute } from "@/config/api-routes";
import type { RecoverPasswordPayload, ResetPasswordPayload } from "@/types/auth";

export interface SwitchCompanyPayload {
    companyId: string;
}

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
    const response = await api.post(buildRoute(API_ROUTES.AUTH, AUTH_PATHS.LOGIN), payload);
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
    const response = await api.post(buildRoute(API_ROUTES.AUTH, AUTH_PATHS.LOGIN_FACE), payload);
    // Resposta esperada: 204 No Content com Set-Cookie header
    if (response.status !== 204) {
        throw new Error("Login facial falhou. Resposta inesperada do servidor.");
    }
};

/**
 * Envia a solicitação para gerar o token de recuperação de senha.
 */
export const recoverPasswordRequest = async (payload: RecoverPasswordPayload): Promise<void> => {
    await api.post(buildRoute(API_ROUTES.AUTH, AUTH_PATHS.RECOVER_PASSWORD), payload);
};

/**
 * Redefine a senha utilizando o token recebido por e-mail.
 */
export const resetPassword = async (payload: ResetPasswordPayload): Promise<void> => {
    await api.post(buildRoute(API_ROUTES.AUTH, AUTH_PATHS.RESET_PASSWORD), payload);
};

/**
 * Troca a empresa ativa do usuário autenticado.
 * O backend reemite o cookie JWT com o novo activeCompanyId.
 * Após a chamada, recarregar a página para aplicar o novo contexto.
 */
export const switchCompany = async (companyId: string): Promise<void> => {
    await api.post(buildRoute(API_ROUTES.AUTH, AUTH_PATHS.SWITCH_COMPANY), { companyId } satisfies SwitchCompanyPayload);
};
