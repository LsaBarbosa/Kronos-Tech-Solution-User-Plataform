// src/services/messageService.ts

import { API_BASE_URL } from "@/config/api"; // Assumindo que esta constante existe
import { Message, MessagePayload } from "@/types/message";
import { EmployeeData } from "@/types/employee"; 

// --- Funções Auxiliares (Puras) ---

const getAuthHeaders = () => ({
    "Content-Type": "application/json",
});

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

// --- Funções de Serviço para AVISOS (fetch, delete, post) ---

/**
 * Busca todas as mensagens visíveis para o usuário logado (usado em Avisos.tsx).
 */
export const fetchMessages = async (): Promise<Message[]> => {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}messages`, {
        method: "GET",
        headers: headers,
    });
    const data = await handleResponse(response);
    return data; 
};

/**
 * Deleta uma mensagem pelo ID (usado em Avisos.tsx).
 */
export const deleteMessage = async (messageId: string): Promise<void> => {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}messages/${messageId}`, {
        method: "DELETE",
        headers: headers,
    });
    await handleResponse(response);
};

/**
 * Envia o novo aviso (mensagem) (usado em CriarAviso.tsx).
 */
export const postMessage = async (payload: MessagePayload): Promise<void> => {
    const headers = getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}messages`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
    });

    await handleResponse(response);
};

// --- Funções de Serviço para COLABORADORES (usado em CriarAviso.tsx) ---

/**
 * Busca a lista de colaboradores ativos para seleção de destinatários.
 */
export const fetchActiveEmployees = async (): Promise<EmployeeData[]> => {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}employee?active=true`, { headers });

    const data = await handleResponse(response);
    
    // Mapeamento id/fullName
    return data.employees.map((emp: any) => ({
        employeeId: emp.employeeId,
        fullName: emp.fullName,
    })) as EmployeeData[];
};

/**
 * Obtém o papel do usuário (role) do token para lógica de permissões.
 */
export const getUserRoleFromToken = async (): Promise<'MANAGER' | 'PARTNER' | 'CTO' | ''> => {
    try {
        const response = await fetch(`${API_BASE_URL}users/own-profile`, { headers: getAuthHeaders() });
        const data = await handleResponse(response);
        const role = data?.role;
        if (role === 'MANAGER' || role === 'PARTNER' || role === 'CTO') return role;
        return '';
    } catch {
        return '';
    }
};