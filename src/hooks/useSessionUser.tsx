import { useAuth, type SessionUser, type SessionRole } from "@/context/AuthContext";

export type { SessionUser, SessionRole };

export const useSessionUser = () => {
  const { sessionUser, isLoadingSessionUser, refreshSessionUser } = useAuth();

  return {
    sessionUser,
    isLoadingSessionUser,
    refreshSessionUser,
  };
};
