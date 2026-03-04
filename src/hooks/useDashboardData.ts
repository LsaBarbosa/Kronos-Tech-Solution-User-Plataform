import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { fetchPendingApprovalsCount, fetchAllWarnings, updateLastSeenMessageTimestamp } from "@/service/dashboard.service";
import { fetchSessionProfile } from "@/service/session-profile.service";
import { ITimeRecordApprovalPageResponse } from "@/types/recordApproval";
import { WarningMessage, hasApprovalPermission } from "@/types/dashboard";
import { UserData } from "@/types/user";

interface UseDashboardDataReturn {
  userData: UserData | null;
  isLoading: boolean;
  pendingApprovalsCount: number;
  newWarnings: WarningMessage[];
  hasApprovalPermission: boolean;
  fetchProfile: () => Promise<void>;
  handleWarningClick: () => Promise<void>;
}

export const useDashboardData = (): UseDashboardDataReturn => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);
  const [allWarnings, setAllWarnings] = useState<WarningMessage[]>([]);

  const { toast } = useToast();
  const navigate = useNavigate();

  const userRole = userData?.role ?? "";
  const canApprove = useMemo(() => hasApprovalPermission(userRole), [userRole]);

  const fetchApprovalsCount = useCallback(async (role: string) => {
    if (!hasApprovalPermission(role)) {
      return { count: 0 };
    }

    try {
      const pageResponse: ITimeRecordApprovalPageResponse = await fetchPendingApprovalsCount();
      return { count: pageResponse.totalElements };
    } catch (error) {
      console.error("Erro ao buscar aprovações:", error);
      return { count: 0 };
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);

    try {
      const { profile } = await fetchSessionProfile();
      setUserData(profile);

      const [approvals, warnings] = await Promise.all([
        fetchApprovalsCount(profile.role),
        fetchAllWarnings(),
      ]);

      setPendingApprovalsCount(approvals.count);
      setAllWarnings(warnings);
    } catch (err: any) {
      if (err.response?.status === 403 && err.response?.data?.type === "TERMS_NOT_ACCEPTED") {
        const backendData = err.response.data;
        const termoUrl = backendData.redirect_url;
        const currentPlatformUrl = window.location.href;

        toast({
          title: "Termos de Uso Pendentes",
          description: "Você será redirecionado em 3 segundos para assinar o termo de consentimento.",
          variant: "destructive",
          duration: 4000,
        });

        setTimeout(() => {
          window.location.href = `${termoUrl}?returnUrl=${encodeURIComponent(currentPlatformUrl)}`;
        }, 3500);

        return;
      }

      console.error("Erro no Dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchApprovalsCount]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const newWarnings = useMemo(() => {
    if (!userData || allWarnings.length === 0) return [];
    const lastSeenTimestamp = new Date(userData.lastSeenMessageTimestamp || 0).getTime();
    return allWarnings.filter((warning) => new Date(warning.createdAt).getTime() > lastSeenTimestamp);
  }, [allWarnings, userData]);

  const handleWarningClick = useCallback(async () => {
    navigate("/avisos");
    if (newWarnings.length > 0) {
      try {
        await updateLastSeenMessageTimestamp();
        setUserData((prev) => (prev ? { ...prev, lastSeenMessageTimestamp: new Date().toISOString() } : null));
      } catch (err: any) {
        toast({
          title: "Atenção",
          description: (err as Error).message || "Falha ao registrar a visualização dos avisos.",
          variant: "destructive",
        });
      }
    }
  }, [newWarnings.length, navigate, toast]);

  return {
    userData,
    isLoading,
    pendingApprovalsCount,
    newWarnings,
    hasApprovalPermission: canApprove,
    fetchProfile,
    handleWarningClick,
  };
};
