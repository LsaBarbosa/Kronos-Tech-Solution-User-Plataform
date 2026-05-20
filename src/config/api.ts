import axios, { type AxiosRequestConfig } from "axios";
import { normalizeServiceError } from "@/service/helpers/service-error.helper";
import { captureError } from "@/lib/observability";
import { fetchCsrfToken, invalidateCsrfToken } from "@/service/csrf.service";

// Extend Axios config to include CSRF retry flag
declare module "axios" {
  interface AxiosRequestConfig {
    _csrfRetry?: boolean;
  }
}

const DEFAULT_LOCAL_API_BASE_URL = ["http://localhost", "8080"].join(":");

const normalizedApiUrl = (url: string): string => url.replace(/\/+$/, "");

export const API_BASE_URL = normalizedApiUrl(
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_LOCAL_API_BASE_URL
);

export const apiUrl = (path: string): string => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const parseJsonSafely = async (response: Response): Promise<unknown> => {
  if (response.status === 204 || response.status === 205) {
    return null;
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  return JSON.parse(text);
};

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

const getErrorCode = (data: unknown): string | undefined => {
  if (!data || typeof data !== "object") {
    return undefined;
  }

  const record = data as Record<string, unknown>;

  if (typeof record.code === "string") {
    return record.code;
  }

  if (typeof record.type === "string") {
    return record.type;
  }

  if (typeof record.kind === "string") {
    return record.kind;
  }

  return undefined;
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

const PUBLIC_AUTH_PATHS = [
  "/auth/login",
  "/auth/login-face",
  "/auth/recover-password",
  "/auth/reset-password",
  "/auth/csrf",
];

const isPublicAuthRequest = (url?: string): boolean =>
  !!url && PUBLIC_AUTH_PATHS.some((path) => url.includes(path));

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
  (response) => {
    // Guarantee that status 204/205 don't try to parse JSON
    if (response.status === 204 || response.status === 205) {
      response.data = null;
    }
    return response;
  },
  async (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const errorCode = getErrorCode(data);
      const originalRequest = error.config;

      // Handle CSRF errors with automatic retry
      if (
        status === 403 &&
        (errorCode === "CSRF_TOKEN_INVALID" || errorCode === "CSRF_INVALID")
      ) {
        // Prevent infinite retry loop
        if (originalRequest?._csrfRetry) {
          invalidateCsrfToken();
          return rejectApiError(error);
        }

        // Mark this request as having attempted CSRF retry
        originalRequest._csrfRetry = true;
        invalidateCsrfToken();

        // Fetch fresh CSRF token
        try {
          const csrfToken = await fetchCsrfToken();
          const headers = originalRequest.headers as Record<string, string>;
          headers[csrfToken.headerName] = csrfToken.token;

          // Retry the original request with new CSRF token
          return api(originalRequest);
        } catch (retryError) {
          console.error("Failed to retry request with fresh CSRF token:", retryError);
          return rejectApiError(error);
        }
      }

      if (status === 403 && errorCode === "TERMS_NOT_ACCEPTED") {
        return rejectApiError(error);
      }

      if (status === 403 && !errorCode) {
        return rejectApiError(error);
      }

      if (status === 401) {
        if (!isPublicAuthRequest(originalRequest?.url)) {
          onSessionExpiredCallback?.("expired");
        }
        return rejectApiError(error);
      }
    }

    return rejectApiError(error);
  }
);
