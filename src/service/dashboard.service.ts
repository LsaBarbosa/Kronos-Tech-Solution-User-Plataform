// src/services/dashboardService.ts

import { API_BASE_URL } from "@/config/api"; 
// 💡 CORREÇÃO: Importa PendingApproval, pois fetchPendingApprovalsCount agora retorna uma lista
import { PendingApproval } from "@/types/recordApproval"; 
// 💡 CORREÇÃO: UserProfile e WarningMessage já tipam o perfil e avisos
import { UserProfile, WarningMessage } from "@/types/dashboard"; 

// --- Funções Auxiliares de Requisição ---

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        // Redirecionamento é tratado no hook, aqui lançamos o erro
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
        const errorMessage = errorData.detail || errorData.message || `Erro de API (${response.status})`;
        throw new Error(errorMessage);
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }
    return {};
};

// --- Serviços Corrigidos ---

/**
 * Busca o perfil completo do usuário logado.
 * Endpoint corrigido para 'employee/own-profile'
 */
export const fetchUserProfile = async (): Promise<UserProfile> => {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}employee/own-profile`, { headers }); 
    const data = await handleResponse(response);
    return data as UserProfile;
};

/**
 * Busca a lista de aprovações pendentes (e retorna o array).
 * Endpoint corrigido para 'records/pending-approvals'
 */
export const fetchPendingApprovalsCount = async (): Promise<PendingApproval[]> => {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}records/pending-approvals`, { headers });
    const data = await handleResponse(response);
    return data as PendingApproval[]; 
};

/**
 * Busca todos os avisos (mensagens) visíveis.
 * Endpoint corrigido para 'messages'
 */
export const fetchAllWarnings = async (): Promise<WarningMessage[]> => {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}messages`, { headers });
    const data = await handleResponse(response);
    return data as WarningMessage[]; 
};

/**
 * Atualiza o timestamp de última visualização de avisos.
 * Endpoint corrigido para 'employee/mark-messages-seen'
 */
export const updateLastSeenMessageTimestamp = async (): Promise<void> => {
    const headers = getAuthHeaders();
    
    // A API de produção usa POST para marcar como visto: employee/mark-messages-seen.
    // O backend deve usar o token para saber qual usuário atualizar o timestamp.
    const response = await fetch(`${API_BASE_URL}employee/mark-messages-seen`, {
        method: 'POST',
        headers: headers,
        // O body é opcional se o backend apenas usa o token para marcar o horário atual.
        // Se o backend espera um body JSON vazio, este é o formato:
        body: JSON.stringify({}), 
    });
    
    // A chamada original no Dashboard.tsx não lê o corpo da resposta em caso de sucesso.
    await handleResponse(response); 
};