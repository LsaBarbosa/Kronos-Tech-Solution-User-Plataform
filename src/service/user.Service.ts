// src/services/userService.ts

import { API_BASE_URL } from "@/config/api"; 
import { UserAccountData, UserData, ChangePasswordData, cleanNumberString } from "@/types/user";

// Função utilitária para obter o token (Adaptada)
const getAuthToken = (): string => {
  return localStorage.getItem("token") || "";
};

const getAuthHeaders = (contentType: 'json' | 'form' = 'json') => {
    const token = getAuthToken();
    if (!token) {
        throw new Error("Token de autenticação não encontrado."); 
    }
    const headers: HeadersInit = {
        "Authorization": `Bearer ${token}`,
    };
    if (contentType === 'json') {
        headers["Content-Type"] = "application/json";
    }
    return headers;
};

const handleResponse = async (response: Response): Promise<any> => {
    if (!response.ok) {
        let errorMessage = `Erro de API (Status ${response.status}).`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorData.message || errorData.title || errorMessage;
        } catch {
            // Ignora se o corpo não for JSON
        }
        throw new Error(errorMessage);
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }
    return {};
};


// --- Funções de Busca ---

/**
 * Busca os dados básicos da conta do usuário.
 */
export const fetchAccountData = async (): Promise<UserAccountData> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}user/account`, { headers });
  return await handleResponse(response) as UserAccountData;
};

/**
 * Busca os dados detalhados do colaborador/usuário.
 */
export const fetchUserData = async (employeeId: string): Promise<UserData> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}employee/${employeeId}/details`, { headers });
  return await handleResponse(response) as UserData;
};

// --- Funções de Atualização ---

/**
 * Atualiza o e-mail do usuário.
 */
export const updateEmail = async (employeeId: string, newEmail: string): Promise<void> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}employee/${employeeId}/email`, {
    method: "PUT",
    headers: headers,
    body: JSON.stringify({ email: newEmail }),
  });

  await handleResponse(response);
};

/**
 * Atualiza o telefone do usuário.
 */
export const updatePhone = async (employeeId: string, newPhone: string): Promise<void> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}employee/${employeeId}/phone`, {
    method: "PUT",
    headers: headers,
    body: JSON.stringify({ phone: cleanNumberString(newPhone) }),
  });

  await handleResponse(response);
};

/**
 * Atualiza a senha do usuário.
 */
export const changePassword = async (data: ChangePasswordData): Promise<void> => {
  if (data.newPassword !== data.confirmNewPassword) {
    throw new Error("As novas senhas não coincidem.");
  }
  
  const headers = getAuthHeaders();
  
  // Remove a confirmação da senha para o payload da API
  const apiPayload = { 
      oldPassword: data.oldPassword, 
      newPassword: data.newPassword 
  };

  const response = await fetch(`${API_BASE_URL}user/change-password`, {
    method: "PUT",
    headers: headers,
    body: JSON.stringify(apiPayload),
  });

  await handleResponse(response);
};
