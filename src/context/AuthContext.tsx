import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
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
  token: string | null;
  isAuthenticated: boolean;
  checkSession: () => Promise<void>;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));

  const clearSession = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const checkSession = useCallback(async () => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    if (!storedToken) {
      setUser(null);
      setStatus("unauthenticated");
      return;
    }

    setStatus("checking");

    try {
      const sessionProfile = await loadSessionProfile();

      setUser({
        account: sessionProfile.accountData,
        profile: sessionProfile.profileData,
        role: sessionProfile.role,
      });
      setToken(storedToken);
      setStatus("authenticated");
    } catch (error) {
      if (isAuthServiceError(error)) {
        clearSession();
        return;
      }

      clearSession();
    }
  }, [clearSession]);

  const login = useCallback(
    async (newToken: string) => {
      localStorage.setItem("token", newToken);
      setToken(newToken);
      await checkSession();
    },
    [checkSession]
  );

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      role: user?.role ?? "",
      token,
      isAuthenticated: status === "authenticated",
      checkSession,
      login,
      logout,
    }),
    [checkSession, login, logout, status, token, user]
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
