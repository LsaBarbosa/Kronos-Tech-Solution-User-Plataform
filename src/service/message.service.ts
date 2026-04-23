// src/services/messageService.ts

import { api } from "@/config/api";
import { Message, MessagePayload } from "@/types/message";
import { EmployeeData } from "@/types/employee"; 
import { extractArray, mapArrayPayload } from "@/service/helpers/response-normalizer.helper";

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
