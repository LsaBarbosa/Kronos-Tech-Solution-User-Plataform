// src/services/recordApproval.service.ts

import { API_BASE_URL } from "@/config/api"; 
import { ITimeRecordApprovalPageResponse, IPendingApprovalQueryParams } from "@/types/recordApproval";


const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error("Token de autenticação não encontrado.");
    }
    return {
        "Authorization": `Bearer ${token}`,
    };
};

const getAuthHeadersWithJson = () => {
    return {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
    };
};

const handleResponse = async (response: Response) => {
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

// --- Funções de Serviço para Aprovações de Ponto (fetch, patch) ---

const BASE_URL = "records"; 

/**
 * Busca as solicitações de aprovação pendentes de forma paginada e filtrada.
 * @param params { page: number, employeeName: string | undefined }
 */
export const fetchPendingApprovals = async (
    params: IPendingApprovalQueryParams
): Promise<ITimeRecordApprovalPageResponse> => {
    const headers = getAuthHeaders();
    
    // Constrói a query string com os parâmetros opcionais
    const query = new URLSearchParams({
        page: params.page.toString(),
        // Adiciona employeeName se existir
        ...(params.employeeName && { employeeName: params.employeeName }),
    }).toString();

    const response = await fetch(`${API_BASE_URL}${BASE_URL}/pending-approvals?${query}`, {
        method: "GET",
        headers: headers,
    });
    return handleResponse(response);
};

/**
 * Aprova uma solicitação de alteração de ponto (PATCH /approve/{timeRecordId}).
 * @param timeRecordId ID do registro a ser aprovado.
 */
export const approveTimeRecordChange = async (timeRecordId: number): Promise<void> => {
    const headers = getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}${BASE_URL}/approve/${timeRecordId}`, {
        method: "PATCH",
        headers: headers,
    });
    await handleResponse(response);
};

/**
 * Rejeita uma solicitação de alteração de ponto (PATCH /reject/{timeRecordId}).
 * @param timeRecordId ID do registro a ser rejeitado.
 */
export const rejectTimeRecordChange = async (timeRecordId: number): Promise<void> => {
    const headers = getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}${BASE_URL}/reject/${timeRecordId}`, {
        method: "PATCH",
        headers: headers,
    });
    await handleResponse(response);
};