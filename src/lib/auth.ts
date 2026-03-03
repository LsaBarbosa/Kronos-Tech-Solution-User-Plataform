const SESSION_MARKER_KEY = "has-session";

export const getStoredToken = (): string | null => localStorage.getItem("token");

export const setStoredToken = (token: string): void => {
  localStorage.setItem("token", token);
  localStorage.setItem(SESSION_MARKER_KEY, "1");
};

export const clearStoredToken = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem(SESSION_MARKER_KEY);
};

export const hasSessionMarker = (): boolean => localStorage.getItem(SESSION_MARKER_KEY) === "1";

export const hasClientSession = (): boolean => getStoredToken() !== null || hasSessionMarker();

export const getBearerToken = (): string => {
  const token = getStoredToken();
  if (!token) {
    throw new Error("Token de autenticação não encontrado.");
  }

  return `Bearer ${token}`;
};
