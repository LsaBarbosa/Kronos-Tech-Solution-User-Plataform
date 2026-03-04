import axios from "axios";

interface ServiceErrorMessageOptions {
  unauthorizedMessage?: string;
  forbiddenMessage?: string;
  validationMessage?: string;
}

type ServiceErrorCode = "UNAUTHORIZED" | "FORBIDDEN" | "VALIDATION" | "UNKNOWN";

interface NormalizedServiceError extends Error {
  code?: ServiceErrorCode;
  statusCode?: number;
}

const createNormalizedError = (message: string, code: ServiceErrorCode, statusCode?: number): Error => {
  const normalizedError = new Error(message) as NormalizedServiceError;
  normalizedError.code = code;
  normalizedError.statusCode = statusCode;
  return normalizedError;
};

export const isAuthenticationError = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status;
    return statusCode === 401 || statusCode === 403;
  }

  if (error instanceof Error) {
    const normalizedError = error as NormalizedServiceError;
    return normalizedError.code === "UNAUTHORIZED" || normalizedError.code === "FORBIDDEN";
  }

  return false;
};

export const getServiceErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as { detail?: string; message?: string; status?: string } | undefined;
    const statusCode = error.response?.status;

    if (statusCode === 401) {
      return "Sua sessão expirou. Faça login novamente.";
    }

    if (statusCode === 403) {
      return "Você não tem permissão para executar esta ação.";
    }

    if (statusCode === 422) {
      return responseData?.detail || responseData?.message || "Dados inválidos. Revise os campos informados.";
    }

    return responseData?.detail || responseData?.message || responseData?.status || fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }

  return fallbackMessage;
};

export const throwServiceError = (
  error: unknown,
  fallbackMessage: string,
  options?: ServiceErrorMessageOptions,
): never => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as { detail?: string; message?: string; status?: string } | undefined;
    const statusCode = error.response?.status;

    if (statusCode === 401) {
      throw createNormalizedError(options?.unauthorizedMessage || "Sua sessão expirou. Faça login novamente.", "UNAUTHORIZED", 401);
    }

    if (statusCode === 403) {
      throw createNormalizedError(options?.forbiddenMessage || "Sua sessão expirou. Faça login novamente.", "FORBIDDEN", 403);
    }

    if (statusCode === 422) {
      throw createNormalizedError(
        responseData?.detail || responseData?.message || options?.validationMessage || "Dados inválidos. Revise os campos informados.",
        "VALIDATION",
        422,
      );
    }
  }

  throw createNormalizedError(getServiceErrorMessage(error, fallbackMessage), "UNKNOWN");
};
