// src/services/messageService.ts

import { api } from "@/config/api";
import { Message, MessagePayload } from "@/types/message";
import { EmployeeData } from "@/types/employee"; 
import { extractArray, mapArrayPayload } from "@/service/helpers/response-normalizer.helper";

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

// --- Funções de Serviço para AVISOS (fetch, delete, post) ---

/**
 * Busca todas as mensagens visíveis para o usuário logado (usado em Avisos.tsx).
 */
export const fetchMessages = async (): Promise<Message[]> => {
    const response = await api.get<Message[]>("/messages");
    return extractArray<Message>(response.data, ["messages"]); 
};

/**
 * Deleta uma mensagem pelo ID (usado em Avisos.tsx).
 */
export const deleteMessage = async (messageId: string): Promise<void> => {
    await api.delete(`/messages/${messageId}`);
};

/**
 * Envia o novo aviso (mensagem) (usado em CriarAviso.tsx).
 */
export const postMessage = async (payload: MessagePayload): Promise<void> => {
    await api.post("/messages", payload);
};

// --- Funções de Serviço para COLABORADORES (usado em CriarAviso.tsx) ---

/**
 * Busca a lista de colaboradores ativos para seleção de destinatários.
 */
export const fetchActiveEmployees = async (): Promise<EmployeeData[]> => {
    const response = await api.get<{ employees: any[] }>("/employee", {
        params: { active: true },
    });
    return mapArrayPayload<any, EmployeeData>(response.data, (emp) => ({
        employeeId: emp.employeeId,
        fullName: emp.fullName,
    }) as EmployeeData, ["employees"]);
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
