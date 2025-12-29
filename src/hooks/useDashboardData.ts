// src/hooks/useDashboardData.ts

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { fetchUserProfile, fetchPendingApprovalsCount, fetchAllWarnings, updateLastSeenMessageTimestamp } from "@/service/dashboard.service";
import { ITimeRecordApprovalPageResponse } from "@/types/recordApproval"; 
import { WarningMessage, hasApprovalPermission } from "@/types/dashboard";
import { UserData } from "@/types/user"; 

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

    const { toast } = useToast();
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
            setUserData(profile as UserData & { role: string });
            
            const [approvals, warnings] = await Promise.all([
                fetchApprovalsCount(profile.role),
                fetchAllWarnings(),
            ]);

            setPendingApprovalsCount(approvals.count);
            setAllWarnings(warnings);

        } catch (err: any) { 
            
            // =================================================================
            // 🛑 LÓGICA DE AVISO + REDIRECIONAMENTO COM DELAY 🛑
            // =================================================================
            if (err.response?.status === 403 && err.response?.data?.type === 'TERMS_NOT_ACCEPTED') {
                
                const backendData = err.response.data;
                const termoUrl = backendData.redirect_url;
                const currentPlatformUrl = window.location.href; 

                // 1. Exibe o aviso visual para o usuário
                toast({
                    title: "Termos de Uso Pendentes",
                    description: "Você será redirecionado em 3 segundos para assinar o termo de consentimento.",
                    variant: "destructive", // Vermelho chama mais atenção, ou use "default"
                    duration: 4000, // Mantém o toast visível durante o delay
                });

                // 2. Aguarda 3 segundos (3000ms) antes de mudar a página
                setTimeout(() => {
                    window.location.href = `${termoUrl}?returnUrl=${encodeURIComponent(currentPlatformUrl)}`;
                }, 3500);
                
                return; // Interrompe o fluxo para não exibir outros erros
            }
            // =================================================================

            console.error("Erro no Dashboard:", err);
            
            // ... restante do tratamento de erros (401, etc)
        } finally {
            setIsLoading(false);
        }
    }, [toast, navigate, fetchApprovalsCount]);

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
            } catch (err: any) {
                toast({ 
                    title: "Atenção", 
                    description: (err as Error).message || "Falha ao registrar a visualização dos avisos.", 
                    variant: "destructive" 
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