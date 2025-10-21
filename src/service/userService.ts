// src/services/userService.ts

import { API_BASE_URL } from "@/config/api"; // Assume-se que esta constante existe
import { UserAccountData, UserData, ChangePasswordData } from "@/types/user";

// Função utilitária para obter o token (Adapte conforme sua lógica de Auth)
const getAuthToken = (): string => {
  return localStorage.getItem("token") || "";
};

// --- Funções de Busca ---

/**
 * Busca os dados básicos da conta do usuário.
 */
export const fetchAccountData = async (): Promise<UserAccountData> => {
  // Nota: O endpoint real pode variar (ex: /user/account)
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/user/account`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Falha ao buscar dados da conta.");
  }
  return response.json();
};

/**
 * Busca os dados detalhados do colaborador.
 */
export const fetchUserData = async (employeeId: string): Promise<UserData> => {
  // Endpoint ajustado para buscar dados do colaborador
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/employee/${employeeId}/details`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Falha ao buscar dados detalhados do usuário.");
  }
  return response.json();
};

// --- Funções de Atualização ---

/**
 * Atualiza o e-mail do usuário.
 */
export const updateEmail = async (employeeId: string, newEmail: string): Promise<void> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/employee/${employeeId}/email`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: newEmail }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.message || "Erro ao salvar e-mail.");
  }
  // Supondo que a API retorna 200/204 em caso de sucesso sem corpo.
};

/**
 * Atualiza o telefone do usuário.
 */
export const updatePhone = async (employeeId: string, newPhone: string): Promise<void> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/employee/${employeeId}/phone`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phone: newPhone }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.message || "Erro ao salvar telefone.");
  }
};

/**
 * Atualiza a senha do usuário.
 */
export const changePassword = async (data: ChangePasswordData): Promise<void> => {
  const token = getAuthToken();
  
  if (data.newPassword !== data.confirmNewPassword) {
    throw new Error("As novas senhas não coincidem.");
  }
  
  const response = await fetch(`${API_BASE_URL}/api/user/change-password`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    // Removendo a confirmação da senha para o corpo da requisição real
    body: JSON.stringify({ 
      oldPassword: data.oldPassword, 
      newPassword: data.newPassword 
    }), 
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.message || "Erro ao alterar a senha.");
  }
};