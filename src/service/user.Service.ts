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
  const response = await fetch(`${API_BASE_URL}users/own-profile`, { headers });
  return await handleResponse(response) as UserAccountData;
};

/**
 * Busca os dados detalhados do colaborador/usuário.
 */
export const fetchUserData = async (employeeId: string): Promise<UserData> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}employee/own-profile`, { headers });
  return await handleResponse(response) as UserData;
};

// --- Funções de Atualização ---

/**
 * Atualiza o e-mail do usuário.
 */
export const updateEmail = async (employeeId: string, newEmail: string): Promise<void> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}employee/update-own-profile`, {
    method: "PATCH",
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
  const response = await fetch(`${API_BASE_URL}employee/update-own-profile`, {
    method: "PATCH",
    headers: headers,
    body: JSON.stringify({ phone: cleanNumberString(newPhone) }),
  });

  await handleResponse(response);
};

/**
 * Atualiza a senha do usuário.
 */
export const changePassword = async (data: ChangePasswordData): Promise<void> => {
  if (data.newPassword !== data.confirmPassword) {
    throw new Error("As novas senhas não coincidem.");
  }
  
  const headers = getAuthHeaders();
  
  // Remove a confirmação da senha para o payload da API
  const apiPayload = { 
     currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword 
  };

  const response = await fetch(`${API_BASE_URL}users/password`, {
    method: "PUT",
    headers: headers,
    body: JSON.stringify(apiPayload),
  });

  await handleResponse(response);
};

/**
 * Busca todos os usuários (ou usuários ativos/inativos) da empresa.
 * @param active - Opcional. true para ativos, false para inativos, null para todos.
 * @returns Lista de dados detalhados do usuário (UserAccountData).
 */
export const listUsers = async (active: boolean | null): Promise<UserAccountData[]> => {
  const headers = getAuthHeaders();
  let url = `${API_BASE_URL}users/search`;

  if (active !== null) {
    const activeQuery = active ? 'true' : 'false';
    url = `${url}?active=${activeQuery}`;
  }

  const response = await fetch(url, { headers });
  
  // O backend retorna um objeto com a chave 'users' que contém a lista (UserListResponse).
  const data = await handleResponse(response);
  
  // Retorna a lista de usuários
  return data.users as UserAccountData[]; 
};
