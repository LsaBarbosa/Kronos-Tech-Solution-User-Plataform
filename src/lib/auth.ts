const SESSION_MARKER_KEY = "has-session";
const LEGACY_TOKEN_KEY = "token";
const COOKIE_SESSION_PLACEHOLDER = "e30.e30.session";
export { COOKIE_SESSION_PLACEHOLDER };

export const getStoredToken = (): string | null => {
  const token = localStorage.getItem(LEGACY_TOKEN_KEY);
  if (token) return token;

  return localStorage.getItem(SESSION_MARKER_KEY) === "1"
    ? COOKIE_SESSION_PLACEHOLDER
    : null;
};

export const setStoredToken = (): void => {
  localStorage.setItem(SESSION_MARKER_KEY, "1");
  // Compatibilidade temporária para fluxos legados que ainda verificam `token` no localStorage.
  localStorage.setItem(LEGACY_TOKEN_KEY, COOKIE_SESSION_PLACEHOLDER);
};

export const clearStoredToken = (): void => {
  localStorage.removeItem(SESSION_MARKER_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
};

export const hasSessionMarker = (): boolean => localStorage.getItem(SESSION_MARKER_KEY) === "1";

export const hasClientSession = (): boolean => hasSessionMarker();

export const getBearerToken = (): string => {
  throw new Error("Bearer token não é mais utilizado. A autenticação agora é via cookie httpOnly.");
};

export const isCookieSessionPlaceholder = (value?: string | null): boolean =>
  value === COOKIE_SESSION_PLACEHOLDER;
