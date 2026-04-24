import axios from "axios";
import { normalizeServiceError } from "@/service/helpers/service-error.helper";
import { getCurrentLocationHref, readStoredValue, redirectBrowserTo } from "@/lib/browser";

export const API_BASE_URL = "http://localhost:8080/";

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

// Cria uma instância do Axios
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Requisição (Para injetar o Token automaticamente)
api.interceptors.request.use(
  (config) => {
    const token = readStoredValue("token"); // Ou onde você guarda o token

    if (isFormDataPayload(config.data)) {
      clearContentTypeHeader(config.headers);
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(normalizeServiceError(error))
);

// Interceptor de Resposta (Para pegar o erro 403 dos Termos)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

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
        
        return Promise.reject(normalizeServiceError(error)); // Interrompe o fluxo para não quebrar a tela
      }

      // Tratamento genérico de sessão expirada (opcional)
      if (status === 403 && !data?.type) {
         // console.log("Acesso negado genérico");
      }
    }
    return Promise.reject(normalizeServiceError(error));
  }
);
