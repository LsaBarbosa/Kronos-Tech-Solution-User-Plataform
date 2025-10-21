// src/services/dashboardService.ts

import { API_BASE_URL } from "@/config/api"; 
import { UserProfile, ApprovalStats, WarningMessage } from "@/types/dashboard";

// --- Funções Auxiliares de Requisição ---

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error("Token de autenticação não encontrado."); 
    }
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };
};

const handleResponse = async (response: Response): Promise<any> => {
    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || errorData.message || `Erro de API (${response.status}) (Status ${response.status})`;
        throw new Error(errorMessage);
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }
    return {};
};

// --- Serviços ---

/**
 * Busca o perfil completo do usuário logado.
 */
export const fetchUserProfile = async (): Promise<UserProfile> => {
    const headers = getAuthHeaders();
    // Endpoint simulado para buscar o perfil (ajuste conforme seu backend)
    const response = await fetch(`${API_BASE_URL}user/profile`, { headers }); 
    const data = await handleResponse(response);
    return data as UserProfile;
};

/**
 * Busca a contagem de aprovações pendentes (apenas para usuários com permissão).
 */
export const fetchPendingApprovalsCount = async (): Promise<ApprovalStats> => {
    const headers = getAuthHeaders();
    // Endpoint simulado para buscar apenas a contagem
    const response = await fetch(`${API_BASE_URL}records/pending-approvals/count`, { headers });
    const data = await handleResponse(response);
    return data as ApprovalStats; // Ex: { count: 5 }
};

/**
 * Busca todos os avisos (para calcular "novos" no hook).
 */
export const fetchAllWarnings = async (): Promise<WarningMessage[]> => {
    const headers = getAuthHeaders();
    // Endpoint simulado para buscar os avisos visíveis para o usuário
    const response = await fetch(`${API_BASE_URL}messages/visible`, { headers });
    const data = await handleResponse(response);
    return data as WarningMessage[]; 
};

/**
 * Atualiza o timestamp de última visualização de avisos.
 */
export const updateLastSeenMessageTimestamp = async (timestamp: string): Promise<void> => {
    const headers = getAuthHeaders();
    // Endpoint simulado para notificar o backend
    const response = await fetch(`${API_BASE_URL}user/update-last-seen-message`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({ timestamp })
    });
    await handleResponse(response);
};