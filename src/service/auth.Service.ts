// src/services/authService.ts

import { API_BASE_URL } from "@/config/api"; 
import { RecoverPasswordPayload, ResetPasswordPayload } from "@/types/auth";

// --- Funções Auxiliares ---

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