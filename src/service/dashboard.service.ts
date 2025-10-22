// src/services/dashboardService.ts

import { API_BASE_URL } from "@/config/api"; 
import { PendingApproval } from "@/types/recordApproval"; 
import { WarningMessage } from "@/types/dashboard"; 
// 💡 CORREÇÃO 6: Importando UserData do local correto
import { UserData } from "@/types/user";

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
 * 💡 CORREÇÃO 7: Usando UserData como tipo de retorno.
 */
export const fetchUserProfile = async (): Promise<UserData> => {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}employee/own-profile`, { headers }); 
    const data = await handleResponse(response);
    return data as UserData;
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
    const response = await fetch(`${API_BASE_URL}employee/mark-messages-seen`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({}), 
    });
    
    await handleResponse(response); 
};