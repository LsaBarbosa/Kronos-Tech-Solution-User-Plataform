import axios from "axios";

interface ServiceErrorMessageOptions {
  unauthorizedMessage?: string;
  forbiddenMessage?: string;
  validationMessage?: string;
}

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
      throw new Error(options?.unauthorizedMessage || "Sua sessão expirou. Faça login novamente.");
    }

    if (statusCode === 403) {
      throw new Error(options?.forbiddenMessage || "Você não tem permissão para executar esta ação.");
    }

    if (statusCode === 422) {
      throw new Error(
        responseData?.detail || responseData?.message || options?.validationMessage || "Dados inválidos. Revise os campos informados.",
      );
    }
  }

  throw new Error(getServiceErrorMessage(error, fallbackMessage));
};
