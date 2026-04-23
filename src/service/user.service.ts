// src/services/userService.ts

import { api } from "@/config/api";
import { API_ROUTES, buildRoute } from "@/config/api-routes";
import { UserAccountData, UserData, ChangePasswordData, cleanNumberString } from "@/types/user";
import { extractArray, extractObject } from "@/service/helpers/response-normalizer.helper";


// --- Funções de Busca ---

/**
 * Busca os dados básicos da conta do usuário.
 */
export const fetchAccountData = async (): Promise<UserAccountData> => {
  const response = await api.get<UserAccountData>(buildRoute(API_ROUTES.USERS, "own-profile"));
  return extractObject<UserAccountData>(response.data) as UserAccountData;
};

/**
 * Busca os dados detalhados do colaborador/usuário.
 */
export const fetchUserData = async (): Promise<UserData> => {
  const response = await api.get<UserData>(buildRoute(API_ROUTES.EMPLOYEE, "own-profile"));
  return extractObject<UserData>(response.data) as UserData;
};

// --- Funções de Atualização ---

/**
 * Atualiza o e-mail do usuário.
 */
export const updateEmail = async (employeeId: string, newEmail: string): Promise<void> => {
  await api.patch(buildRoute(API_ROUTES.EMPLOYEE, "update-own-profile"), { email: newEmail });
};

/**
 * Atualiza o telefone do usuário.
 */
export const updatePhone = async (employeeId: string, newPhone: string): Promise<void> => {
  await api.patch(buildRoute(API_ROUTES.EMPLOYEE, "update-own-profile"), { phone: cleanNumberString(newPhone) });
};

/**
 * Atualiza a senha do usuário.
 */
export const changePassword = async (data: ChangePasswordData): Promise<void> => {
  if (data.newPassword !== data.confirmPassword) {
    throw new Error("As novas senhas não coincidem.");
  }
  
  // Remove a confirmação da senha para o payload da API
  const apiPayload = { 
     currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword 
  };

  await api.put(buildRoute(API_ROUTES.USERS, "password"), apiPayload);
};

/**
 * Busca todos os usuários (ou usuários ativos/inativos) da empresa.
 * @param active - Opcional. true para ativos, false para inativos, null para todos.
 * @returns Lista de dados detalhados do usuário (UserAccountData).
 */
export const listUsers = async (active: boolean | null): Promise<UserAccountData[]> => {
  const response = await api.get<{ users: UserAccountData[] }>(buildRoute(API_ROUTES.USERS, "search"), {
    params: active !== null ? { active } : undefined,
  });
  
  return extractArray<UserAccountData>(response.data, ["users"]); 
};
