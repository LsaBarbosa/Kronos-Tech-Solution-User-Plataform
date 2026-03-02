export const getStoredToken = (): string | null => localStorage.getItem("token");

export const clearStoredToken = (): void => {
  localStorage.removeItem("token");
};

export const getBearerToken = (): string => {
  const token = getStoredToken();
  if (!token) {
    throw new Error("Token de autenticação não encontrado.");
  }

  return `Bearer ${token}`;
};
