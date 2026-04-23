// src/services/authService.ts

import { isAxiosError } from "axios";
import { API_BASE_URL, api } from "@/config/api";
import { RecoverPasswordPayload, ResetPasswordPayload } from "@/types/auth";

// --- Funções Auxiliares ---

type ErrorResponseBody = {
    detail?: string;
    message?: string;
    title?: string;
};

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

const getErrorMessage = (errorData: unknown, fallback: string) => {
    if (!errorData || typeof errorData !== "object") {
        return fallback;
    }

    const data = errorData as ErrorResponseBody;
    return data.detail || data.message || data.title || fallback;
};

const normalizeServiceError = (error: unknown): Error => {
    if (isAxiosError(error)) {
        const status = error.response?.status;
        const fallback = status
            ? `Erro de conexão ou solicitação (Status ${status}).`
            : "Erro de conexão ou solicitação.";

        return new Error(getErrorMessage(error.response?.data, fallback));
    }

    if (error instanceof Error) {
        return error;
    }

    return new Error("Erro desconhecido ao processar solicitação.");
};

const handleResponse = async (response: Response): Promise<any> => {
    // 400 Bad Request, 401 Unauthorized, etc.
    if (!response.ok) {
        let errorMessage = `Erro de conexão ou solicitação (Status ${response.status}).`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorData.message || errorData.title || errorMessage;
        } catch {
            // Ignora se o corpo não for JSON
        }
        throw new Error(errorMessage);
    }
    
    // Retorna corpo JSON se houver
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }
    return {};
};

// --- Serviços de Login ---

/**
 * Autentica usuário e senha no backend e retorna o token de sessão.
 */
export const loginWithPassword = async (payload: LoginPayload): Promise<LoginResponse> => {
    try {
        const response = await api.post<LoginResponse>("/auth/login", payload);

        if (!response.data?.token) {
            throw new Error("Resposta de login sem token.");
        }

        return response.data;
    } catch (error) {
        throw normalizeServiceError(error);
    }
};

/**
 * Autentica por biometria facial e retorna o token de sessão.
 */
export const loginWithFace = async (payload: FaceLoginPayload): Promise<LoginResponse> => {
    try {
        const response = await api.post<LoginResponse>("/auth/login-face", payload);

        if (!response.data?.token) {
            throw new Error("Resposta de login facial sem token.");
        }

        return response.data;
    } catch (error) {
        throw normalizeServiceError(error);
    }
};

// --- Serviços de Recuperação ---

/**
 * Envia a solicitação para gerar o token de recuperação de senha.
 */
export const recoverPasswordRequest = async (payload: RecoverPasswordPayload): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}auth/recover-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    // Se a API retornar sucesso (200/204), a função passa.
    await handleResponse(response);
};

/**
 * Redefine a senha utilizando o token recebido por e-mail.
 */
export const resetPassword = async (payload: ResetPasswordPayload): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    // Se a API retornar sucesso (200/204), a função passa.
    await handleResponse(response);
};
