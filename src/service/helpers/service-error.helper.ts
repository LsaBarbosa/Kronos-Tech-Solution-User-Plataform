import axios from "axios";

export const getServiceErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as { detail?: string; message?: string; status?: string } | undefined;
    return responseData?.detail || responseData?.message || responseData?.status || fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }

  return fallbackMessage;
};
