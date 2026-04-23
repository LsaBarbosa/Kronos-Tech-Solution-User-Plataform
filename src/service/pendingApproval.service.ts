// src/services/recordApproval.service.ts

import { api } from "@/config/api";
import { ITimeRecordApprovalPageResponse, IPendingApprovalQueryParams,
  ITimeOffQueryParams,
  ITimeRecordPageResponse,
  IRequestTimeOffData} from "@/types/recordApproval";
import { extractObject } from "@/service/helpers/response-normalizer.helper";

// --- Funções de Serviço para Aprovações de Ponto (fetch, patch) ---

const BASE_URL = "records"; 

/**
 * Busca as solicitações de aprovação pendentes de forma paginada e filtrada.
 * @param params { page: number, employeeName: string | undefined }
 */
export const fetchPendingApprovals = async (
    params: IPendingApprovalQueryParams
): Promise<ITimeRecordApprovalPageResponse> => {
    const response = await api.get<ITimeRecordApprovalPageResponse>(`/${BASE_URL}/pending-approvals`, {
        params: {
            page: params.page,
            ...(params.employeeName && { employeeName: params.employeeName }),
        },
    });
    return extractObject<ITimeRecordApprovalPageResponse>(response.data) as ITimeRecordApprovalPageResponse;
};

/**
 * Aprova uma solicitação de alteração de ponto (PATCH /approve/{timeRecordId}).
 * @param timeRecordId ID do registro a ser aprovado.
 */
export const approveTimeRecordChange = async (timeRecordId: number): Promise<void> => {
    await api.patch(`/${BASE_URL}/approve/${timeRecordId}`);
};

/**
 * Rejeita uma solicitação de alteração de ponto (PATCH /reject/{timeRecordId}).
 * @param timeRecordId ID do registro a ser rejeitado.
 */
export const rejectTimeRecordChange = async (timeRecordId: number): Promise<void> => {
    await api.patch(`/${BASE_URL}/reject/${timeRecordId}`);
};

/**
 * Envia a solicitação de abono manual (Time Off Request) com upload opcional de documento.
 * @param requestData Dados do período e managerId.
 * @param document Arquivo de comprovação (opcional).
 * @returns O ID do TimeRecord criado (number).
 */
export const requestTimeOff = async (requestData: IRequestTimeOffData, document?: File): Promise<number> => {
    const formData = new FormData();

    // 1. Adiciona o JSON da requisição
    const jsonRequest = JSON.stringify(requestData);
    formData.append('request', new Blob([jsonRequest], { type: 'application/json' }), 'request.json');

    // 2. Adiciona o documento (se existir)
    if (document) {
        formData.append('document', document, document.name);
    }

    const response = await api.post<number>(`/${BASE_URL}/time-off-request`, formData);
    return response.data;
};

/**
 * Lista as solicitações de Abono (Time Off Requests) com paginação e filtro.
 * @param params { page, size, employeeName, status }
 */
export const listTimeOffRequests = async (
    params: ITimeOffQueryParams
): Promise<ITimeRecordPageResponse> => { // Usando o tipo importado
    const response = await api.get<ITimeRecordPageResponse>(`/${BASE_URL}/time-off/requests`, {
        params: {
            page: params.page,
            size: params.size,
            status: params.status,
            ...(params.employeeName && { employeeName: params.employeeName }),
        },
    });
    return extractObject<ITimeRecordPageResponse>(response.data) as ITimeRecordPageResponse;
};

/**
 * Aprova uma solicitação de abono manual.
 * @param timeRecordId ID do registro de ponto a ser aprovado.
 */
export const approveTimeOff = async (timeRecordId: number): Promise<void> => {
    await api.patch(`/${BASE_URL}/time-off/approve/${timeRecordId}`);
};

/**
 * Rejeita uma solicitação de abono manual.
 * @param timeRecordId ID do registro de ponto a ser rejeitado.
 */
export const rejectTimeOff = async (timeRecordId: number): Promise<void> => {
    await api.patch(`/${BASE_URL}/time-off/reject/${timeRecordId}`);
};
