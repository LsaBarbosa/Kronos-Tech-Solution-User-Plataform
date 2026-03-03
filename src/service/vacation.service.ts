 

import { API_BASE_URL } from "@/config/api";
import { IVacationRequestResponse, IVacationQueryParams, RequestTimeOffRequestPayload, IVacationApprovalRequest, IRequestVacationRequest, IManagerOption } from "@/types/vacation";
 import { format } from "date-fns"; 

const getAuthHeaders = () => ({
    "Content-Type": "application/json",
});

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
// Fim Funções Auxiliares

const BASE_URL = "records";

/**
 * Busca as solicitações de férias consolidadas (GET /records/vacation-request).
 * @param params { page: number, size: number, status: string, employeeName: string | undefined }
 */

export const requestVacation = async (data: IRequestVacationRequest): Promise<number[]> => {
    const headers = getAuthHeadersWithJson();

    const response = await fetch(`${API_BASE_URL}${BASE_URL}/vacation-request`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
    });
    return handleResponse(response) as Promise<number[]>;
};

export const fetchVacationRequests = async (
    params: IVacationQueryParams
): Promise<IVacationRequestResponse[]> => {
    const headers = getAuthHeaders();

    // Constrói a query string, garantindo que o size esteja na URL para paginação manual no back-end
    const query = new URLSearchParams({
        page: params.page.toString(),
        size: params.size.toString(),
        status: params.status,
        ...(params.employeeName && { employeeName: params.employeeName }),
    }).toString();

    const response = await fetch(`${API_BASE_URL}${BASE_URL}/vacation-request?${query}`, {
        method: "GET",
        headers: headers,
    });
    return handleResponse(response) as Promise<IVacationRequestResponse[]>;
};

/**
 * Envia uma lista de IDs para aprovação de férias (PATCH /vacation-request/approve).
 */
export const approveVacationRequest = async (timeRecordIds: number[]): Promise<void> => {
    const headers = getAuthHeadersWithJson();
    const body: IVacationApprovalRequest = { timeRecordIds: timeRecordIds };

    const response = await fetch(`${API_BASE_URL}${BASE_URL}/vacation-request/approve`, {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify(body),
    });
    await handleResponse(response);
};

/**
 * Envia uma lista de IDs para rejeição de férias (PATCH /vacation-request/reject).
 */
export const rejectVacationRequest = async (timeRecordIds: number[]): Promise<void> => {
    const headers = getAuthHeadersWithJson();
    const body: IVacationApprovalRequest = { timeRecordIds: timeRecordIds };

    const response = await fetch(`${API_BASE_URL}${BASE_URL}/vacation-request/reject`, {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify(body),
    });
    await handleResponse(response);
};

export const fetchManagerOptions = async (): Promise<IManagerOption[]> => {
    const headers = getAuthHeaders();
    
    // Busca todos os usuários ativos
    // O endpoint GET /users/search filtra por empresa no backend para o Manager/Partner.
    const response = await fetch(`${API_BASE_URL}users/search?active=true`, {
        method: "GET",
        headers: headers,
    });
    
    const data = await handleResponse(response);
    
    const allUsers = data.users || []; 

    // Filtra no frontend por Role 'MANAGER' e mapeia para o formato de opção.
    // user.role e user.userId são retornados por UserResponse.java
    return allUsers
        .filter((user: any) => user.role === 'MANAGER')
        .map((user: any) => ({
            userId: user.userId,
            username: user.username, 
        })) as IManagerOption[];
};
export const fetchPendingVacationCount = async (): Promise<number> => {
    const headers = getAuthHeaders();
    
    // Configuração para buscar todas as pendências (size=500 é um limite seguro para contagem do dashboard)
    const query = new URLSearchParams({
        page: '0',
        size: '500', 
        status: 'PENDING',
    }).toString();

    const response = await fetch(`${API_BASE_URL}${BASE_URL}/vacation-request?${query}`, {
        method: "GET",
        headers: headers,
    });
    
    const requests = await handleResponse(response);
    
    // O backend retorna um array. A contagem é o tamanho do array.
    if (Array.isArray(requests)) {
        return requests.length;
    }
    return 0;
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

  // 3. Configura o fetch
    const url = `${API_BASE_URL}records/time-off/request`; 
  
  const response = await fetch(url, {
    method: 'POST',
    // IMPORTANTE: NÃO defina 'Content-Type' como 'multipart/form-data'. 
    // O navegador faz isso automaticamente ao usar FormData, incluindo a boundary correta.
    headers: {
        
    },
    body: formData,
  });

  // 4. Lida com a Resposta (Modelo Fetch)
  if (!response.ok) {
    let errorDetail = `Erro HTTP ${response.status}: ${response.statusText}.`;
    
    // Tenta ler o corpo como JSON para mensagens de erro detalhadas (ProblemDetail do Spring)
    try {
      const errorJson = await response.json();
      // Assume a estrutura ProblemDetail (ex: detail) ou message
      errorDetail = errorJson.detail || errorJson.message || errorDetail; 
    } catch (e) {
      // Se falhar ao ler JSON, o erro HTTP padrão é mantido
    }
    
    // Lança um erro que será capturado pelo hook
    throw new Error(errorDetail); 
  }

  // O backend retorna o Long (ID do TimeRecord) no corpo como JSON.
  const responseData = await response.json(); 
  
  return responseData as number; 
};