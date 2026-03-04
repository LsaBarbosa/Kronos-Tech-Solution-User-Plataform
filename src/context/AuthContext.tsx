import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "@/config/api";

export type SessionRole = "PARTNER" | "MANAGER" | "CTO" | "ADMIN" | "USER" | string;

export interface SessionUser {
  employeeId: string;
  role: SessionRole;
  fullName: string;
  username?: string;
  email?: string;
}

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AccountProfileResponse {
  employeeId: string;
  role: SessionRole;
  username?: string;
}

interface EmployeeProfileResponse {
  employeeId: string;
  fullName: string;
  email?: string;
}

interface AuthContextValue {
  authStatus: AuthStatus;
  sessionUser: SessionUser | null;
  isLoadingSessionUser: boolean;
  bootstrapSession: () => Promise<void>;
  refreshSessionUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const clearSessionAndRedirectToLogin = () => {
  localStorage.removeItem("token");

  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [isLoadingSessionUser, setIsLoadingSessionUser] = useState(true);

  const bootstrapSession = useCallback(async () => {
    setAuthStatus("loading");
    setIsLoadingSessionUser(true);

    try {
      const accountResponse = await fetch(`${API_BASE_URL}users/own-profile`, {
        method: "GET",
        credentials: "include",
      });

      if (accountResponse.status === 401) {
        setSessionUser(null);
        setAuthStatus("unauthenticated");
        clearSessionAndRedirectToLogin();
        return;
      }

      if (!accountResponse.ok) {
        setSessionUser(null);
        setAuthStatus("unauthenticated");
        return;
      }

      const account = (await accountResponse.json()) as AccountProfileResponse;

      const employeeResponse = await fetch(`${API_BASE_URL}employee/own-profile`, {
        method: "GET",
        credentials: "include",
      });

      if (employeeResponse.status === 401) {
        setSessionUser(null);
        setAuthStatus("unauthenticated");
        clearSessionAndRedirectToLogin();
        return;
      }

      if (!employeeResponse.ok) {
        setSessionUser(null);
        setAuthStatus("unauthenticated");
        return;
      }

      const employeeProfile = (await employeeResponse.json()) as EmployeeProfileResponse;

      setSessionUser({
        employeeId: account.employeeId || employeeProfile.employeeId,
        role: account.role,
        fullName: employeeProfile.fullName || account.username || "",
        username: account.username,
        email: employeeProfile.email,
      });
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
