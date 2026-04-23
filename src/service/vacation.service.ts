 

import { api } from "@/config/api";
import { IVacationRequestResponse, IVacationQueryParams, RequestTimeOffRequestPayload, IVacationApprovalRequest, IRequestVacationRequest, IManagerOption } from "@/types/vacation";
 import { format } from "date-fns"; 
import { extractArray, mapArrayPayload } from "@/service/helpers/response-normalizer.helper";

const BASE_URL = "records";

/**
 * Busca as solicitações de férias consolidadas (GET /records/vacation-request).
 * @param params { page: number, size: number, status: string, employeeName: string | undefined }
 */

export const requestVacation = async (data: IRequestVacationRequest): Promise<number[]> => {
    const response = await api.post<number[]>(`/${BASE_URL}/vacation-request`, data);
    return extractArray<number>(response.data);
};

export const fetchVacationRequests = async (
    params: IVacationQueryParams
): Promise<IVacationRequestResponse[]> => {
    // Constrói a query string, garantindo que o size esteja na URL para paginação manual no back-end
    const response = await api.get<IVacationRequestResponse[]>(`/${BASE_URL}/vacation-request`, {
        params: {
            page: params.page,
            size: params.size,
            status: params.status,
            ...(params.employeeName && { employeeName: params.employeeName }),
        },
    });
    return extractArray<IVacationRequestResponse>(response.data);
};

/**
 * Envia uma lista de IDs para aprovação de férias (PATCH /vacation-request/approve).
 */
export const approveVacationRequest = async (timeRecordIds: number[]): Promise<void> => {
    const body: IVacationApprovalRequest = { timeRecordIds: timeRecordIds };

    await api.patch(`/${BASE_URL}/vacation-request/approve`, body);
};

/**
 * Envia uma lista de IDs para rejeição de férias (PATCH /vacation-request/reject).
 */
export const rejectVacationRequest = async (timeRecordIds: number[]): Promise<void> => {
    const body: IVacationApprovalRequest = { timeRecordIds: timeRecordIds };

    await api.patch(`/${BASE_URL}/vacation-request/reject`, body);
};

export const fetchManagerOptions = async (): Promise<IManagerOption[]> => {
    // Busca todos os usuários ativos
    // O endpoint GET /users/search filtra por empresa no backend para o Manager/Partner.
    const response = await api.get<{ users?: any[] }>("/users/search", {
        params: { active: true },
    });
    
    // Filtra no frontend por Role 'MANAGER' e mapeia para o formato de opção.
    // user.role e user.userId são retornados por UserResponse.java
    return mapArrayPayload<any, any>(response.data, (user) => user, ["users"])
        .filter((user: any) => user.role === 'MANAGER')
        .map((user: any) => ({
            userId: user.userId,
            username: user.username, 
        })) as IManagerOption[];
};
export const fetchPendingVacationCount = async (): Promise<number> => {
    // Configuração para buscar todas as pendências (size=500 é um limite seguro para contagem do dashboard)
    const response = await api.get(`/${BASE_URL}/vacation-request`, {
        params: {
            page: 0,
            size: 500,
            status: "PENDING",
        },
    });
    
    const requests = extractArray(response.data);
    
    return requests.length;
};
/**
 * Envia uma solicitação de abono (time-off) com suporte a anexo de documento.
 * Utiliza o modelo fetch.
 * * @param payload Dados da solicitação (datas, horas, managerId).
 * @param document Arquivo de comprovante (opcional).
 * @returns O ID (Long) do TimeRecord criado.
 */
export const requestTimeOff = async (
  payload: RequestTimeOffRequestPayload,
  document: File | null
): Promise<number> => {
  const formData = new FormData();

  // 1. Anexa o JSON do payload como uma parte 'request'
  const requestBlob = new Blob([JSON.stringify(payload)], {
    type: "application/json",
  });
  // O nome da parte deve ser 'request' para coincidir com @RequestPart("request") no backend
  formData.append("request", requestBlob, "request.json");

  // 2. Anexa o arquivo de documento como uma parte 'document' (se existir)
  if (document) {
     // O nome da parte deve ser 'document' para coincidir com @RequestPart(value = "document") no backend
    formData.append("document", document);
  }

  const response = await api.post<number>("records/time-off/request", formData);
  
  return response.data; 
};
