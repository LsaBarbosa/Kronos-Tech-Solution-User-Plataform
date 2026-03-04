import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { fetchCurrentSession, logoutSession } from "@/service/auth.Service";
import type { UserAccountData } from "@/types/user";

type AuthStatus = "checking" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  session: UserAccountData | null;
  isAuthenticated: boolean;
  checkSession: () => Promise<boolean>;
  clearSession: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [session, setSession] = useState<UserAccountData | null>(null);

  const clearSession = useCallback(() => {
    setSession(null);
    setStatus("unauthenticated");
  }, []);

  const checkSession = useCallback(async (): Promise<boolean> => {
    setStatus("checking");
    try {
      const profile = await fetchCurrentSession();
      setSession(profile as UserAccountData);
      setStatus("authenticated");
      return true;
    } catch (error) {
      if (isAxiosError(error) && [401, 403].includes(error.response?.status ?? 0)) {
        clearSession();
        return false;
      }

      console.error("Falha ao carregar sessão autenticada.", error);
      setSession(null);
      setStatus("unauthenticated");
      return false;
    }
  }, [clearSession]);

  const logout = useCallback(async () => {
    try {
      await logoutSession();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const value = useMemo(
    () => ({
      status,
      session,
      isAuthenticated: status === "authenticated",
      checkSession,
      clearSession,
      logout,
    }),
    [status, session, checkSession, clearSession, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
