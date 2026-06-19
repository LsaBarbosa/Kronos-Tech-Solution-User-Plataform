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
import { api, registerSessionExpiredHandler, apiUrl } from "@/config/api";
import { invalidateCsrfToken } from "@/service/csrf.service";
import { normalizeServiceError } from "@/service/helpers/service-error.helper";
import { loadSessionProfile } from "@/service/session-profile.service";
import { checkTermsStatus } from "@/service/terms.service";
import type { BiometricConsentStatus } from "@/types/legal";
import type { UserAccountData, UserData } from "@/types/user";
import { safeLogger } from "@/utils/security/safeLogger";

export type AuthStatus = "checking" | "authenticated" | "unauthenticated";

interface AuthUser {
  account: UserAccountData;
  profile: UserData | null;
  role: string;
  biometricConsent?: BiometricConsentStatus;
}

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  role: string;
  isAuthenticated: boolean;
  biometricConsent: BiometricConsentStatus | null;
  checkSession: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshBiometricConsent: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [biometricConsent, setBiometricConsent] = useState<BiometricConsentStatus | null>(null);

  const clearSession = useCallback(() => {
    setUser(null);
    setBiometricConsent(null);
    setStatus("unauthenticated");
  }, []);

  const handleSessionExpired = useCallback(() => {
    clearSession();
    navigate("/login", { state: { reason: "session_expired" }, replace: true });
  }, [clearSession, navigate]);

  const refreshBiometricConsent = useCallback(async () => {
    try {
      const consentStatus = await checkTermsStatus();
      setBiometricConsent(consentStatus);
      if (user) {
        setUser({ ...user, biometricConsent: consentStatus });
      }
    } catch (error) {
      safeLogger.error("Failed to refresh biometric consent status:", error);
    }
  }, [user]);

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

      try {
        const consentStatus = await checkTermsStatus();
        setBiometricConsent(consentStatus);
      } catch (error) {
        safeLogger.error("Failed to load biometric consent status:", error);
      }
    } catch (error) {
      const serviceError = normalizeServiceError(error);

      if (serviceError.kind === "terms") {
        setUser(null);
        setStatus("authenticated");
        try {
          const consentStatus = await checkTermsStatus();
          setBiometricConsent(consentStatus);
        } catch (error) {
          safeLogger.error("Failed to load biometric consent status:", error);
        }
        return;
      }

      if (serviceError.kind === "auth") {
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
      const response = await api.post("/auth/logout");
      if (response.status !== 204) {
        throw new Error("Logout falhou. Resposta inesperada do servidor.");
      }
      invalidateCsrfToken();
    } catch (error) {
      safeLogger.warn("Erro ao fazer logout:", error);
      invalidateCsrfToken();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  useEffect(() => {
    registerSessionExpiredHandler(handleSessionExpired);
  }, [handleSessionExpired]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      role: user?.role ?? "",
      isAuthenticated: status === "authenticated",
      biometricConsent,
      checkSession,
      login,
      logout,
      refreshBiometricConsent,
    }),
    [status, user, biometricConsent, checkSession, login, logout, refreshBiometricConsent]
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
