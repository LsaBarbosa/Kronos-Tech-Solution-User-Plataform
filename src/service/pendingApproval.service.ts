// src/services/recordApproval.service.ts

import { API_BASE_URL } from "@/config/api"; 
import { ITimeRecordApprovalPageResponse, IPendingApprovalQueryParams, TimeRecordApprovalPageResponse, 
  TimeRecordPageResponse, 
  ITimeOffQueryParams,
  ITimeRecordPageResponse,
  IRequestTimeOffData} from "@/types/recordApproval";


const getAuthHeaders = () => ({});

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

/**
 * Envia a solicitação de abono manual (Time Off Request) com upload opcional de documento.
 * @param requestData Dados do período e managerId.
 * @param document Arquivo de comprovação (opcional).
 * @returns O ID do TimeRecord criado (number).
 */
export const requestTimeOff = async (requestData: IRequestTimeOffData, document?: File): Promise<number> => {
    const headers = getAuthHeaders(); 
    const formData = new FormData();

    // 1. Adiciona o JSON da requisição
    const jsonRequest = JSON.stringify(requestData);
    formData.append('request', new Blob([jsonRequest], { type: 'application/json' }), 'request.json');

    // 2. Adiciona o documento (se existir)
    if (document) {
        formData.append('document', document, document.name);
    }

    const response = await fetch(`${API_BASE_URL}${BASE_URL}/time-off-request`, {
        method: "POST",
        headers: headers, 
        body: formData,
    });
    
    return handleResponse(response);
};

/**
 * Lista as solicitações de Abono (Time Off Requests) com paginação e filtro.
 * @param params { page, size, employeeName, status }
 */
export const listTimeOffRequests = async (
    params: ITimeOffQueryParams
): Promise<ITimeRecordPageResponse> => { // Usando o tipo importado
    const headers = getAuthHeaders();
    
    // Constrói a query string
    const query = new URLSearchParams({
        page: params.page.toString(),
        size: params.size.toString(),
        status: params.status,
        // Adiciona employeeName se existir
        ...(params.employeeName && { employeeName: params.employeeName }),
    }).toString();

    const response = await fetch(`${API_BASE_URL}${BASE_URL}/time-off/requests?${query}`, {
        method: "GET",
        headers: headers,
    });
    return handleResponse(response);
};

/**
 * Aprova uma solicitação de abono manual.
 * @param timeRecordId ID do registro de ponto a ser aprovado.
 */
export const approveTimeOff = async (timeRecordId: number): Promise<void> => {
    const headers = getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}${BASE_URL}/time-off/approve/${timeRecordId}`, {
        method: "PATCH",
        headers: headers,
    });
    await handleResponse(response);
};

/**
 * Rejeita uma solicitação de abono manual.
 * @param timeRecordId ID do registro de ponto a ser rejeitado.
 */
export const rejectTimeOff = async (timeRecordId: number): Promise<void> => {
    const headers = getAuthHeaders(); 

    const response = await fetch(`${API_BASE_URL}${BASE_URL}/time-off/reject/${timeRecordId}`, {
        method: "PATCH",
        headers: headers,
    });
    await handleResponse(response);
};
