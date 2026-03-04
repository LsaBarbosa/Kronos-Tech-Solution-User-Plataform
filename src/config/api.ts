 
  

  import axios from 'axios';
import { redirectToLogin } from '@/utils/authRedirect';

export const API_BASE_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const handleTermsRedirect = (status?: number, data?: any) => {
  if (status === 403 && data?.type === 'TERMS_NOT_ACCEPTED') {
    const redirectBaseUrl = data.redirect_url;
    const currentPlatformUrl = window.location.href;
    const finalRedirectUrl = `${redirectBaseUrl}?returnUrl=${encodeURIComponent(currentPlatformUrl)}`;
    window.location.href = finalRedirectUrl;
    return true;
  }

  return false;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        redirectToLogin();
        return Promise.reject(error);
      }

      // LÓGICA DO REDIRECIONAMENTO DOS TERMOS
      if (status === 403 && data?.type === 'TERMS_NOT_ACCEPTED') {
        
        // 1. Pega a URL que o backend mandou (https://termo.kronossolutions.tech/)
        const redirectBaseUrl = data.redirect_url;
        
        // 2. Pega a URL atual da plataforma para o usuário voltar depois
        const currentPlatformUrl = window.location.href;

        // 3. Monta a URL final com o parâmetro de retorno
        // Ex: https://termo...?returnUrl=https://plataforma.../dashboard
        const finalRedirectUrl = `${redirectBaseUrl}?returnUrl=${encodeURIComponent(currentPlatformUrl)}`;

        // 4. Força o redirecionamento
        window.location.href = finalRedirectUrl;
        
        return Promise.reject(error); // Interrompe o fluxo para não quebrar a tela
      }

      // Tratamento genérico de sessão expirada (opcional)
      if (status === 403 && !data?.type) {
         // console.log("Acesso negado genérico");
      }
    }
    return Promise.reject(error);
  }
);

export const apiFetch = async (input: string, init: RequestInit = {}) => {
  const isAbsoluteUrl = /^https?:\/\//.test(input);
  const url = isAbsoluteUrl ? input : `${API_BASE_URL}${input}`;

  const response = await fetch(url, {
    ...init,
    credentials: 'include',
    headers: init.headers,
  });

  return response;
};

export const parseApiResponse = async <T = any>(response: Response): Promise<T> => {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  const body = isJson ? await response.json() : undefined;

  if (!response.ok) {
    const detail = body?.detail || body?.message || body?.title || `Erro de API (${response.status})`;

    handleTermsRedirect(response.status, body);

    throw new Error(detail);
  }

  return (body ?? ({} as T)) as T;
};
