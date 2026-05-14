import axios from "axios";
import { normalizeServiceError } from "@/service/helpers/service-error.helper";
import { getCurrentLocationHref, redirectBrowserTo } from "@/lib/browser";
import { captureError } from "@/lib/observability";
import { fetchCsrfToken, invalidateCsrfToken } from "@/service/csrf.service";

const DEFAULT_LOCAL_API_BASE_URL = ["http://localhost", "8080"].join(":");

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_LOCAL_API_BASE_URL;

export const buildTermsRedirectUrl = (
  redirectBaseUrl: string,
  currentPlatformUrl: string
) => `${redirectBaseUrl}?returnUrl=${encodeURIComponent(currentPlatformUrl)}`;

const clearContentTypeHeader = (headers: unknown) => {
  if (!headers || typeof headers !== "object") {
    return;
  }

  const typedHeaders = headers as {
    delete?: (name: string) => void;
    setContentType?: (value?: string | false) => void;
    common?: Record<string, unknown>;
    post?: Record<string, unknown>;
    put?: Record<string, unknown>;
    patch?: Record<string, unknown>;
    [key: string]: unknown;
  };

  if (typeof typedHeaders.delete === "function") {
    typedHeaders.delete("Content-Type");
    typedHeaders.delete("content-type");
  }

  if (typeof typedHeaders.setContentType === "function") {
    typedHeaders.setContentType(false);
  }

  delete typedHeaders["Content-Type"];
  delete typedHeaders["content-type"];

  for (const bucket of [typedHeaders.common, typedHeaders.post, typedHeaders.put, typedHeaders.patch]) {
    if (!bucket) {
      continue;
    }

    delete bucket["Content-Type"];
    delete bucket["content-type"];
  }
};

const isFormDataPayload = (value: unknown): value is FormData => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as {
    append?: unknown;
    get?: unknown;
  };

  return typeof candidate.append === "function" && typeof candidate.get === "function";
};

export const createCorrelationId = () => {
  const cryptoRandomUUID = globalThis.crypto?.randomUUID?.bind(globalThis.crypto);

  if (cryptoRandomUUID) {
    return cryptoRandomUUID();
  }

  return `kronos-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const ensureCorrelationIdHeader = (headers: unknown) => {
  if (!headers || typeof headers !== "object") {
    return;
  }

  const typedHeaders = headers as {
    get?: (name: string) => unknown;
    set?: (name: string, value: string) => void;
    [key: string]: unknown;
  };

  const currentValue =
    (typeof typedHeaders.get === "function" ? typedHeaders.get("X-Correlation-Id") : undefined) ??
    typedHeaders["X-Correlation-Id"] ??
    typedHeaders["x-correlation-id"];

  if (currentValue) {
    return;
  }

  const correlationId = createCorrelationId();
  if (typeof typedHeaders.set === "function") {
    typedHeaders.set("X-Correlation-Id", correlationId);
    return;
  }

  typedHeaders["X-Correlation-Id"] = correlationId;
};

type SessionExpiredCallback = (reason: "expired" | "revoked") => void;
let onSessionExpiredCallback: SessionExpiredCallback | null = null;

export const registerSessionExpiredHandler = (cb: SessionExpiredCallback) => {
  onSessionExpiredCallback = cb;
};

const isStateChangingMethod = (method?: string): boolean => {
  if (!method) return false;
  const upperMethod = method.toUpperCase();
  return ["POST", "PUT", "PATCH", "DELETE"].includes(upperMethod);
};

const endpoints_exempt_from_csrf = [
  "/auth/login",
  "/auth/login-face",
  "/auth/logout",
  "/auth/recover-password",
  "/auth/reset-password",
  "/auth/csrf",
];

const isCsrfRequired = (url: string): boolean => {
  return !endpoints_exempt_from_csrf.some((exempt) => url.includes(exempt));
};

const rejectApiError = (error: unknown) => {
  const serviceError = normalizeServiceError(error);

  captureError(serviceError, {
    domain: "api",
    operation: "http-response",
    kind: serviceError.kind,
    status: serviceError.status,
  });

  return Promise.reject(serviceError);
};

// Cria uma instância do Axios
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de Requisição
api.interceptors.request.use(
  async (config) => {
    config.headers = config.headers ?? {};
    ensureCorrelationIdHeader(config.headers);

    if (isFormDataPayload(config.data)) {
      clearContentTypeHeader(config.headers);
    }

    // Inject CSRF token for state-changing methods
    if (isStateChangingMethod(config.method) && isCsrfRequired(config.url || "")) {
      try {
        const csrfToken = await fetchCsrfToken();
        const headers = config.headers as Record<string, string>;
        headers[csrfToken.headerName] = csrfToken.token;
      } catch (error) {
        // Log the error but don't fail the request
        console.error("Failed to fetch CSRF token:", error);
      }
    }

    return config;
  },
  (error) => Promise.reject(normalizeServiceError(error))
);

// Interceptor de Resposta (Para pegar o erro 403 dos Termos e CSRF)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Handle CSRF errors
      if (status === 403 && data?.kind === "CSRF_INVALID") {
        invalidateCsrfToken();
        return rejectApiError(error);
      }

      // LÓGICA DO REDIRECIONAMENTO DOS TERMOS
      if (status === 403 && data?.type === "TERMS_NOT_ACCEPTED") {
        // 1. Pega a URL que o backend mandou (https://termo.kronossolutions.tech/)
        const redirectBaseUrl = data.redirect_url;

        // 2. Pega a URL atual da plataforma para o usuário voltar depois
        const currentPlatformUrl = getCurrentLocationHref();

        // 3. Monta a URL final com o parâmetro de retorno
        // Ex: https://termo...?returnUrl=https://plataforma.../dashboard
        const finalRedirectUrl = buildTermsRedirectUrl(redirectBaseUrl, currentPlatformUrl);

        // 4. Força o redirecionamento
        redirectBrowserTo(finalRedirectUrl);

        return rejectApiError(error);
      }

      if (status === 403 && !data?.type) {
        return rejectApiError(error);
      }

      if (status === 401) {
        onSessionExpiredCallback?.("expired");
        return rejectApiError(error);
      }
    }

    return rejectApiError(error);
  }
);
