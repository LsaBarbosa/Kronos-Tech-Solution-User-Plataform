// src/hooks/useDashboardData.ts

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
// 💡 CORREÇÃO: Funções do dashboardService.ts já corrigido
import { fetchUserProfile, fetchPendingApprovalsCount, fetchAllWarnings, updateLastSeenMessageTimestamp } from "@/service/dashboard.service";
// 💡 CORREÇÃO: Importa a tipagem do array de aprovações (do outro arquivo de types)
import { PendingApproval } from "@/types/recordApproval"; 
import { UserProfile, WarningMessage, hasApprovalPermission } from "@/types/dashboard";

interface UseDashboardDataReturn {
    userData: UserProfile | null;
    isLoading: boolean;
    pendingApprovalsCount: number;
    newWarnings: WarningMessage[];
    hasApprovalPermission: boolean;
    fetchProfile: () => Promise<void>;
    handleWarningClick: () => Promise<void>;
}

export const useDashboardData = (): UseDashboardDataReturn => {
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);
    const [allWarnings, setAllWarnings] = useState<WarningMessage[]>([]);
    const [error, setError] = useState<string | null>(null);

    const { toast } = useToast();
    const navigate = useNavigate();

    // 💡 CORREÇÃO: Usa a função hasApprovalPermission do types
    const userRole = userData?.role || '';
    const canApprove = useMemo(() => hasApprovalPermission(userRole), [userRole]);


    // 1. Busca de Aprovações Pendentes (separada para reuso)
    const fetchApprovalsCount = useCallback(async (role: string) => {
        if (!hasApprovalPermission(role)) {
             return { count: 0 };
        }
        try {
            // 💡 CORREÇÃO: Espera o array e retorna o .length
            const approvals: PendingApproval[] = await fetchPendingApprovalsCount();
            return { count: approvals.length };
        } catch (error) {
            console.error("Erro ao buscar aprovações:", error);
            return { count: 0 };
        }
    }, []);

    // 2. Busca de Perfil e Contadores
    const fetchProfile = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const profile = await fetchUserProfile(); 
            setUserData(profile);
            
            // Busca dados secundários (Contagem e Avisos) em paralelo
            const [approvals, warnings] = await Promise.all([
                fetchApprovalsCount(profile.role), // Passa a role do perfil
                fetchAllWarnings(),
            ]);

            setPendingApprovalsCount(approvals.count);
            setAllWarnings(warnings);
        } catch (err: any) {
            setError(err.message);
            console.error("Erro no Dashboard:", err);
            if (err.message.includes("Token")) {
                toast({ title: "Sessão Expirada", description: "Por favor, faça login novamente.", variant: "destructive" });
                navigate("/login");
            } else {
                toast({ title: "Erro de Conexão", description: err.message, variant: "destructive" });
            }
        } finally {
            setIsLoading(false);
        }
    }, [toast, navigate, fetchApprovalsCount]); // fetchApprovalsCount agora é uma dependência

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);
    
    // 3. Lógica para filtrar novos avisos (useMemo)
    const newWarnings = useMemo(() => {
        if (!userData || allWarnings.length === 0) return [];
        
        const lastSeenTimestamp = new Date(userData.lastSeenMessageTimestamp || 0).getTime();

        return allWarnings.filter(warning => 
            new Date(warning.createdAt).getTime() > lastSeenTimestamp
        );
    }, [allWarnings, userData]);
    
    // 4. Handler para clicar no aviso (Atualiza timestamp no backend)
    const handleWarningClick = useCallback(async () => {
        // Redireciona imediatamente
        navigate("/avisos"); 

        if (newWarnings.length > 0) {
            try {
                // 💡 CORREÇÃO: Chama a função corrigida do service (não precisa de timestamp no body)
                await updateLastSeenMessageTimestamp(); 
                
                // Atualiza o estado localmente (para remover o contador visualmente)
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