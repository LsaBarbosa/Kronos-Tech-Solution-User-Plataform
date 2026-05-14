import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { api, registerSessionExpiredHandler } from "@/config/api";
import { isAuthServiceError } from "@/service/helpers/service-error.helper";
import { loadSessionProfile } from "@/service/session-profile.service";
import type { UserAccountData, UserData } from "@/types/user";

export type AuthStatus = "checking" | "authenticated" | "unauthenticated";

interface AuthUser {
  account: UserAccountData;
  profile: UserData | null;
  role: string;
}

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  role: string;
  isAuthenticated: boolean;
  checkSession: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [user, setUser] = useState<AuthUser | null>(null);

  const clearSession = useCallback(() => {
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const handleSessionExpired = useCallback(() => {
    clearSession();
    navigate("/login", { state: { reason: "session_expired" }, replace: true });
  }, [clearSession, navigate]);

  const checkSession = useCallback(async () => {
    setStatus("checking");

    try {
      const sessionProfile = await loadSessionProfile();

      setUser({
        account: sessionProfile.accountData,
        profile: sessionProfile.profileData,
        role: sessionProfile.role,
      });
      setStatus("authenticated");
    } catch (error) {
      if (isAuthServiceError(error)) {
        clearSession();
        return;
      }

      clearSession();
    }
  }, [clearSession]);

  const login = useCallback(async () => {
    setStatus("checking");
    await checkSession();
  }, [checkSession]);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.warn("Erro ao fazer logout:", error);
    } finally {
      clearSession();
    }
  }, [clearSession]);

  useEffect(() => {
    registerSessionExpiredHandler(handleSessionExpired);
  }, [handleSessionExpired]);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      role: user?.role ?? "",
      isAuthenticated: status === "authenticated",
      checkSession,
      login,
      logout,
    }),
    [status, user, checkSession, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
};
