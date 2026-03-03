// src/services/dashboardService.ts

import { API_BASE_URL } from "@/config/api"; 
import { ITimeRecordApprovalResponse, ITimeRecordApprovalPageResponse } from "@/types/recordApproval";
import { WarningMessage } from "@/types/dashboard"; 
// 💡 CORREÇÃO 6: Importando UserData do local correto
import { UserData } from "@/types/user";

// --- Funções Auxiliares de Requisição ---

const getAuthHeaders = () => ({
    "Content-Type": "application/json",
});

const handleResponse = async (response: Response): Promise<any> => {
    if (!response.ok) {
        // 1. Tenta ler o JSON de erro do backend
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { message: `Erro de API (${response.status})` };
        }

        const errorMessage = errorData.detail || errorData.message || `Erro de API (${response.status})`;
        
        // 2. Cria o objeto de erro
        const error: any = new Error(errorMessage);
        
        // 3. ANEXA OS DADOS DO BACKEND AO ERRO
        // Isso permite que o hook useDashboardData leia 'error.response.data.type'
        error.response = {
            status: response.status,
            data: errorData
        };
        
        throw error;
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
export const fetchPendingApprovalsCount = async (): Promise<ITimeRecordApprovalPageResponse> => { // ✅ CORREÇÃO: Retorna o objeto de páginação
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}records/pending-approvals`, { headers });
    const data = await handleResponse(response);
    return data as ITimeRecordApprovalPageResponse; // ✅ CORREÇÃO: Cast para o tipo de resposta paginada
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