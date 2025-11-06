 

import { API_BASE_URL } from "@/config/api";
import { IVacationRequestResponse, IVacationQueryParams, IVacationApprovalRequest, IRequestVacationRequest, IManagerOption } from "@/types/vacation";
 
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