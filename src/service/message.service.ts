// src/services/messageService.ts

import { API_BASE_URL } from "@/config/api"; // Assumindo que esta constante existe
import { Message, MessagePayload } from "@/types/message";
import { EmployeeListItem } from "@/types/employee"; 

// --- Funções Auxiliares (Puras) ---

const decodeToken = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(payload);
    } catch (error) {
        console.error("Falha ao decodificar o token", error);
        return null;
    }
};

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error("Token de autenticação não encontrado.");
    }
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
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
export const fetchActiveEmployees = async (): Promise<EmployeeListItem[]> => {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}employee?active=true`, { headers });

    const data = await handleResponse(response);
    
    // Mapeamento id/fullName
    return data.employees.map((emp: any) => ({
        employeeId: emp.employeeId,
        fullName: emp.fullName,
    })) as EmployeeListItem[];
};

/**
 * Obtém o papel do usuário (role) do token para lógica de permissões.
 */
export const getUserRoleFromToken = (): 'MANAGER' | 'PARTNER' | 'CTO' | '' => {
    const token = localStorage.getItem("token");
    if (!token) return '';
    
    const decoded = decodeToken(token);
    const role = decoded?.role;

    if (role === 'MANAGER' || role === 'PARTNER' || role === 'CTO') {
        return role;
    }
    return '';
};