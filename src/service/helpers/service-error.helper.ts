import { isAxiosError } from "axios";

export type ServiceErrorKind =
  | "validation"
  | "auth"
  | "terms"
  | "rateLimit"
  | "conflict"
  | "serviceUnavailable"
  | "http"
  | "network"
  | "unknown";

export interface ServiceErrorResponse {
  status?: number;
  data?: unknown;
}

export class ServiceError extends Error {
  kind: ServiceErrorKind;
  status?: number;
  data?: unknown;
  response?: ServiceErrorResponse;

  constructor(
    message: string,
    {
      kind,
      status,
      data,
    }: {
      kind: ServiceErrorKind;
      status?: number;
      data?: unknown;
    }
  ) {
    super(message);
    this.name = "ServiceError";
    this.kind = kind;
    this.status = status;
    this.data = data;
    this.response = status ? { status, data } : undefined;
  }
}

const DEFAULT_MESSAGES: Record<ServiceErrorKind, string> = {
  validation: "Erro de validação. Verifique os dados informados.",
  auth: "Sessão expirada ou acesso não autorizado.",
  terms: "Aceite dos termos de uso pendente.",
  rateLimit: "Processamento em andamento. Aguarde alguns instantes e tente novamente.",
  conflict: "Já existe um registro com esses dados.",
  serviceUnavailable: "Serviço temporariamente indisponível. Tente novamente em instantes.",
  http: "Erro ao processar solicitação.",
  network: "Erro de conexão. Verifique sua internet e tente novamente.",
  unknown: "Erro desconhecido ao processar solicitação.",
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const firstString = (values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value;
    }

    if (isRecord(value)) {
      const message = extractMessage(value);
      if (message) {
        return message;
      }
    }
  }

  return undefined;
};

const extractNestedValidationMessage = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    return firstString(value);
  }

  if (!isRecord(value)) {
    return typeof value === "string" && value.trim() ? value : undefined;
  }

  for (const nestedValue of Object.values(value)) {
    if (typeof nestedValue === "string" && nestedValue.trim()) {
      return nestedValue;
    }

    if (Array.isArray(nestedValue)) {
      const message = firstString(nestedValue);
      if (message) {
        return message;
      }
    }

    if (isRecord(nestedValue)) {
      const message = extractMessage(nestedValue);
      if (message) {
        return message;
      }
    }
  }

  return undefined;
};

const extractMessage = (data: unknown): string | undefined => {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (!isRecord(data)) {
    return undefined;
  }

  const directMessage = firstString([
    data.detail,
    data.message,
    data.title,
    data.error,
  ]);

  if (directMessage) {
    return directMessage;
  }

  return (
    extractNestedValidationMessage(data.errors) ||
    extractNestedValidationMessage(data.fieldErrors) ||
    extractNestedValidationMessage(data.violations)
  );
};

const getErrorKind = (status?: number, data?: unknown): ServiceErrorKind => {
  if (!status) {
    return "network";
  }

  if (status === 400) {
    return "validation";
  }

  if (status === 409) {
    return "conflict";
  }

  if (status === 429) {
    return "rateLimit";
  }

  if (status === 503) {
    return "serviceUnavailable";
  }

  if (status === 403 && isRecord(data) && data.type === "TERMS_NOT_ACCEPTED") {
    return "terms";
  }

  if (status === 401 || status === 403) {
    return "auth";
  }

  return "http";
};

const getFallbackMessage = (kind: ServiceErrorKind, status?: number) => {
  if (kind === "http" && status) {
    return `Erro de API (Status ${status}).`;
  }

  return DEFAULT_MESSAGES[kind];
};

export const normalizeHttpResponseError = (
  status: number,
  data?: unknown
): ServiceError => {
  const kind = getErrorKind(status, data);
  const message = extractMessage(data) || getFallbackMessage(kind, status);

  return new ServiceError(message, { kind, status, data });
};

export const normalizeServiceError = (error: unknown): ServiceError => {
  if (error instanceof ServiceError) {
    return error;
  }

  if (isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;

    if (status) {
      return normalizeHttpResponseError(status, data);
    }

    return new ServiceError(
      error.message || DEFAULT_MESSAGES.network,
      { kind: "network" }
    );
  }

  if (error instanceof Error) {
    return new ServiceError(error.message, { kind: "unknown" });
  }

  return new ServiceError(DEFAULT_MESSAGES.unknown, { kind: "unknown" });
};

export const getServiceErrorMessage = (
  error: unknown,
  fallback = DEFAULT_MESSAGES.unknown
) => {
  if (error instanceof ServiceError || isAxiosError(error)) {
    return normalizeServiceError(error).message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export const isAuthServiceError = (error: unknown) => {
  const serviceError = normalizeServiceError(error);
  return serviceError.kind === "auth" || serviceError.kind === "terms";
};
