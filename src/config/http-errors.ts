export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
} as const;

export const API_ERROR_TYPE = {
  TERMS_NOT_ACCEPTED: "TERMS_NOT_ACCEPTED",
} as const;

export type ApiErrorPayload = {
  type?: string;
  detail?: string;
  message?: string;
  title?: string;
  redirect_url?: string;
};

export const DEFAULT_ERROR_MESSAGE = "Não foi possível concluir a operação. Tente novamente.";

export const SESSION_INVALID_MESSAGE = "Sua sessão expirou. Faça login novamente.";

export const buildTermsRedirectUrl = (redirectUrl: string, returnUrl = window.location.href): string => {
  const separator = redirectUrl.includes("?") ? "&" : "?";
  return `${redirectUrl}${separator}returnUrl=${encodeURIComponent(returnUrl)}`;
};

export const getErrorMessageFromPayload = (
  payload?: ApiErrorPayload,
  fallback: string = DEFAULT_ERROR_MESSAGE,
): string => {
  return payload?.detail || payload?.message || payload?.title || fallback;
};
