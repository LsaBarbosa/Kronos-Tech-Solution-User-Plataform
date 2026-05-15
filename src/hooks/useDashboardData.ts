// src/hooks/useDashboardData.ts

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserProfile, fetchPendingApprovalsCount, fetchAllWarnings, updateLastSeenMessageTimestamp } from "@/service/dashboard.service";
import type { ITimeRecordApprovalPageResponse } from "@/types/recordApproval"; 
import type { WarningMessage} from "@/types/dashboard";
import { hasApprovalPermission } from "@/types/dashboard";
import type { UserData } from "@/types/user"; 
import { isAuthServiceError, normalizeServiceError } from "@/service/helpers/service-error.helper";
import { showErrorToast } from "@/lib/feedback";

interface UseDashboardDataReturn {
    userData: UserData & { role: string } | null; 
    isLoading: boolean;
    pendingApprovalsCount: number;
    newWarnings: WarningMessage[];
    hasApprovalPermission: boolean;
    fetchProfile: () => Promise<void>;
    handleWarningClick: () => Promise<void>;
}

export const useDashboardData = (): UseDashboardDataReturn => {
    const [userData, setUserData] = useState<(UserData & { role: string }) | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);
    const [allWarnings, setAllWarnings] = useState<WarningMessage[]>([]);
    
    // Removi o estado de erro local pois vamos tratar direto no catch ou redirecionar
    // const [error, setError] = useState<string | null>(null); 

    const navigate = useNavigate();

    const userRole = userData?.role || '';
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
        // setError(null);
        try {
            const profile = await fetchUserProfile(); 
            setUserData({
                ...profile,
                role: profile.role ?? "",
            });
            
            const [approvals, warnings] = await Promise.all([
                fetchApprovalsCount(profile.role ?? ""),
                fetchAllWarnings(),
            ]);

            setPendingApprovalsCount(approvals.count);
            setAllWarnings(warnings);

        } catch (err: unknown) {
            const normalized = normalizeServiceError(err);

            console.error("Erro no Dashboard:", normalized);
            if (isAuthServiceError(normalized)) {
                navigate("/login");
            }
        } finally {
            setIsLoading(false);
        }
    }, [navigate, fetchApprovalsCount]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);
    
    const newWarnings = useMemo(() => {
        if (!userData || allWarnings.length === 0) return [];
        const lastSeenTimestamp = new Date(userData.lastSeenMessageTimestamp || 0).getTime();
        return allWarnings.filter(warning => 
            new Date(warning.createdAt).getTime() > lastSeenTimestamp
        );
    }, [allWarnings, userData]);
    
    const handleWarningClick = useCallback(async () => {
        navigate("/avisos"); 
        if (newWarnings.length > 0) {
            try {
                await updateLastSeenMessageTimestamp(); 
                setUserData(prev => prev ? { ...prev, lastSeenMessageTimestamp: new Date().toISOString() } : null);
            } catch (err: unknown) {
                const normalized = normalizeServiceError(err);
                showErrorToast("Atenção", normalized.message || "Falha ao registrar a visualização dos avisos.");
            }
        }
    }, [newWarnings.length, navigate]);

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
