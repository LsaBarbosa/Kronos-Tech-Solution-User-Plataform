import { API_BASE_URL } from "@/config/api";

const SESSION_MARKER_KEY = "has-session";
const LEGACY_TOKEN_KEY = "token";
const COOKIE_SESSION_PLACEHOLDER = "e30.e30.session";

export { COOKIE_SESSION_PLACEHOLDER };

/**
 * Mantido apenas para compatibilidade com partes legadas da aplicação.
 * A autenticação real acontece exclusivamente por cookie HttpOnly.
 */
export const getStoredToken = (): string | null => {
  const token = localStorage.getItem(LEGACY_TOKEN_KEY);
  if (token) return token;

  return localStorage.getItem(SESSION_MARKER_KEY) === "1"
    ? COOKIE_SESSION_PLACEHOLDER
    : null;
};

/**
 * Compatibilidade com fluxos antigos; não participa mais da decisão de acesso.
 */
export const setStoredToken = (): void => {
  localStorage.setItem(SESSION_MARKER_KEY, "1");
  localStorage.setItem(LEGACY_TOKEN_KEY, COOKIE_SESSION_PLACEHOLDER);
};

export const clearStoredToken = (): void => {
  localStorage.removeItem(SESSION_MARKER_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
};

export const hasSessionMarker = (): boolean => localStorage.getItem(SESSION_MARKER_KEY) === "1";

/**
 * Verifica sessão real no backend via cookie HttpOnly.
 */
export const validateHttpOnlySession = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}users/own-profile`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        clearStoredToken();
      }
      return false;
    }

    // sessão válida: mantém marcador opcional para compatibilidade
    setStoredToken();
    return true;
  } catch {
    return false;
  }
};

export const getBearerToken = (): string => {
  throw new Error("Bearer token não é mais utilizado. A autenticação agora é via cookie httpOnly.");
};

export const isCookieSessionPlaceholder = (value?: string | null): boolean =>
  value === COOKIE_SESSION_PLACEHOLDER;
