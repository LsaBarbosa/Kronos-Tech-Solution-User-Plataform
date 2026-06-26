// src/services/messageService.ts

import { api } from "@/config/api";
import { API_ROUTES, buildRoute } from "@/config/api-routes";
import { PAGINATION_DEFAULTS } from "@/constants/pagination";
import type { Message, MessagePayload, MessagePriority, MessageScope } from "@/types/message";
import type { EmployeeListItem } from "@/types/document";
import {
  extractArray,
  safeBoolean,
  safeDate,
  safeNumber,
  safeString,
} from "@/service/helpers/response-normalizer.helper";

// --- Funções de Serviço para AVISOS (fetch, delete, post) ---

export interface MessageQueryParams {
    page?: number;
    size?: number;
}

export interface CreateMessageResult {
  messageId: string;
  scope: MessageScope;
  deliveredCount: number;
}

const VALID_PRIORITIES = new Set<MessagePriority>(["NORMAL", "ALERT", "CRITICAL"]);
const VALID_SCOPES = new Set<MessageScope>(["DIRECT", "GLOBAL"]);

const normalizePriority = (value: unknown): MessagePriority => {
  if (typeof value === "string" && VALID_PRIORITIES.has(value as MessagePriority)) {
    return value as MessagePriority;
  }
  return "NORMAL";
};

const normalizeScope = (value: unknown, recipientEmployeeId: string | null): MessageScope => {
  if (typeof value === "string" && VALID_SCOPES.has(value as MessageScope)) {
    return value as MessageScope;
  }
  return recipientEmployeeId ? "DIRECT" : "GLOBAL";
};

const normalizeMessage = (payload: unknown): Message => {
  const raw = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const recipientEmployeeId =
    typeof raw.recipientEmployeeId === "string" ? raw.recipientEmployeeId : null;

  return {
    messageId: safeString(raw.messageId),
    title: safeString(raw.title),
    messageText: safeString(raw.messageText),
    priority: normalizePriority(raw.priority),
    scope: normalizeScope(raw.scope, recipientEmployeeId),
    createdAt: safeDate(raw.createdAt, new Date(0).toISOString()),
    senderEmployeeId: safeString(raw.senderEmployeeId ?? raw.employeeId),
    recipientEmployeeId,
    deliveredCount:
      typeof raw.deliveredCount === "number" ? safeNumber(raw.deliveredCount) : undefined,
    seen: typeof raw.seen === "boolean" ? safeBoolean(raw.seen) : undefined,
    senderName: safeString(raw.senderName) || undefined,
  };
};

/**
 * Busca todas as mensagens visíveis para o usuário logado (usado em Avisos.tsx).
 */
export const fetchMessages = async (params: MessageQueryParams = {}): Promise<Message[]> => {
    const response = await api.get<Message[]>(buildRoute(API_ROUTES.MESSAGES), {
        params: {
            page: params.page ?? PAGINATION_DEFAULTS.DEFAULT_PAGE,
            size: params.size ?? PAGINATION_DEFAULTS.DEFAULT_PAGE_SIZE,
        },
    });
    return extractArray<unknown>(response.data, ["messages"]).map(normalizeMessage);
};

/**
 * Deleta uma mensagem pelo ID (usado em Avisos.tsx).
 */
export const deleteMessage = async (messageId: string): Promise<void> => {
    await api.delete(buildRoute(API_ROUTES.MESSAGES, messageId));
};

/**
 * Envia o novo aviso (mensagem) (usado em CriarAviso.tsx).
 */
export const postMessage = async (payload: MessagePayload): Promise<CreateMessageResult | null> => {
    const response = await api.post<CreateMessageResult>(`/${API_ROUTES.MESSAGES}`, payload);
    const data = response.data;

    if (!data || typeof data !== "object") {
      return null;
    }

    return {
      messageId: safeString((data as Record<string, unknown>).messageId),
      scope: normalizeScope((data as Record<string, unknown>).scope, null),
      deliveredCount: safeNumber((data as Record<string, unknown>).deliveredCount),
    };
};

// --- Funções de Serviço para COLABORADORES (usado em CriarAviso.tsx) ---

/**
 * Busca a lista de colaboradores ativos para seleção de destinatários.
 */
export const fetchActiveEmployees = async (): Promise<EmployeeListItem[]> => {
    const response = await api.get<{ employees?: EmployeeListItem[] }>(`/${API_ROUTES.EMPLOYEE}`, {
        params: { active: true },
    });
    return extractArray<EmployeeListItem>(response.data, ["employees"]);
};
