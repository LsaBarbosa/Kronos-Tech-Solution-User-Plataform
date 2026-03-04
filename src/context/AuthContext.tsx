import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "@/config/api";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  authStatus: AuthStatus;
  bootstrapSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");

  const bootstrapSession = useCallback(async () => {
    setAuthStatus("loading");

    try {
      const response = await fetch(`${API_BASE_URL}employee/own-profile`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        setAuthStatus("unauthenticated");
        return;
      }

      setAuthStatus("authenticated");
    } catch {
      setAuthStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    void bootstrapSession();
  }, [bootstrapSession]);

  const value = useMemo(
    () => ({
      authStatus,
      bootstrapSession,
    }),
    [authStatus, bootstrapSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return context;
};
