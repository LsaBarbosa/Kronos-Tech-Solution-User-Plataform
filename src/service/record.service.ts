// src/services/recordService.ts

import { API_BASE_URL } from "@/config/api"; //
import { PendingApproval, ApiErrorResponse } from "@/types/recordApproval";

const getAuthToken = (): string => {
  return localStorage.getItem("token") || "";
};

// Função auxiliar para lidar com a resposta e erros da API de forma centralizada
const handleResponse = async (response: Response): Promise<any> => {
  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json();
    const errorMessage = errorData.detail || errorData.message || `Erro de API (${response.status})`;
    throw new Error(errorMessage);
  }
  // Verifica se há corpo JSON na resposta (PATCH pode não ter)
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return {};
};

/**
 * Busca todas as solicitações de alteração de registro de ponto pendentes.
 */
export const fetchPendingApprovals = async (): Promise<PendingApproval[]> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Token de autenticação não encontrado.");
  }

  const response = await fetch(`${API_BASE_URL}records/pending-approvals`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
};

/**
 * Aprova uma solicitação de alteração de registro de ponto.
 */
export const approveRecord = async (timeRecordId: number): Promise<void> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Token de autenticação não encontrado.");
  }

  const response = await fetch(`${API_BASE_URL}records/approve/${timeRecordId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  await handleResponse(response);
};

/**
 * Rejeita uma solicitação de alteração de registro de ponto.
 */
export const rejectRecord = async (timeRecordId: number): Promise<void> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Token de autenticação não encontrado.");
  }

  const response = await fetch(`${API_BASE_URL}records/reject/${timeRecordId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  await handleResponse(response);
};