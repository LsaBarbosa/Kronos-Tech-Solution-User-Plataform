import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchAccountData, fetchUserData } from "@/service/user.Service";

export type SessionRole = "PARTNER" | "MANAGER" | "CTO" | "ADMIN" | "USER" | string;

export interface SessionUser {
  employeeId: string;
  role: SessionRole;
  fullName: string;
  username?: string;
  email?: string;
}

interface SessionUserContextValue {
  sessionUser: SessionUser | null;
  isLoadingSessionUser: boolean;
  refreshSessionUser: () => Promise<void>;
}

const SessionUserContext = createContext<SessionUserContextValue | undefined>(undefined);

export const SessionUserProvider = ({ children }: { children: React.ReactNode }) => {
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [isLoadingSessionUser, setIsLoadingSessionUser] = useState(true);

  const refreshSessionUser = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setSessionUser(null);
      setIsLoadingSessionUser(false);
      return;
    }

    setIsLoadingSessionUser(true);
    try {
      const account = await fetchAccountData();
      const employeeProfile = await fetchUserData(account.employeeId);

      setSessionUser({
        employeeId: account.employeeId || employeeProfile.employeeId,
        role: account.role,
        fullName: employeeProfile.fullName || account.username,
        username: account.username,
        email: employeeProfile.email,
      });
    } catch (error) {
      console.error("Falha ao carregar SessionUser", error);
      setSessionUser(null);
    } finally {
      setIsLoadingSessionUser(false);
    }
  }, []);

  useEffect(() => {
    refreshSessionUser();
  }, [refreshSessionUser]);

  const value = useMemo(
    () => ({ sessionUser, isLoadingSessionUser, refreshSessionUser }),
    [sessionUser, isLoadingSessionUser, refreshSessionUser],
  );

  return <SessionUserContext.Provider value={value}>{children}</SessionUserContext.Provider>;
};

export const useSessionUser = () => {
  const context = useContext(SessionUserContext);
  if (!context) {
    throw new Error("useSessionUser deve ser usado dentro de SessionUserProvider");
  }
  return context;
};
