import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchSessionUser, SessionRole } from "@/service/auth/session.service";

export interface SessionUser {
  employeeId: string;
  role: SessionRole;
  fullName: string;
  username?: string;
  email?: string;
}

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  authStatus: AuthStatus;
  sessionUser: SessionUser | null;
  isLoadingSessionUser: boolean;
  bootstrapSession: () => Promise<void>;
  refreshSessionUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [isLoadingSessionUser, setIsLoadingSessionUser] = useState(true);

  const bootstrapSession = useCallback(async () => {
    setAuthStatus("loading");
    setIsLoadingSessionUser(true);

    try {
      const sessionUserData = await fetchSessionUser();

      setSessionUser(sessionUserData);
      setAuthStatus("authenticated");
    } catch {
      setSessionUser(null);
      setAuthStatus("unauthenticated");
    } finally {
      setIsLoadingSessionUser(false);
    }
  }, []);

  const refreshSessionUser = useCallback(async () => {
    await bootstrapSession();
  }, [bootstrapSession]);

  useEffect(() => {
    void bootstrapSession();
  }, [bootstrapSession]);

  const value = useMemo(
    () => ({
      authStatus,
      sessionUser,
      isLoadingSessionUser,
      bootstrapSession,
      refreshSessionUser,
    }),
    [authStatus, sessionUser, isLoadingSessionUser, bootstrapSession, refreshSessionUser],
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
