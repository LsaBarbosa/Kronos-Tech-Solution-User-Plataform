// src/hooks/useDashboardData.ts

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
// Importação do serviço (mantida)
import { fetchUserProfile, fetchPendingApprovalsCount, fetchAllWarnings, updateLastSeenMessageTimestamp } from "@/service/dashboard.service";
import { PendingApproval } from "@/types/recordApproval"; 
// 💡 CORREÇÃO 1: Removendo a importação de UserProfile que não existe mais em dashboard.ts
import { WarningMessage, hasApprovalPermission } from "@/types/dashboard";
// 💡 CORREÇÃO 2: Importando o tipo UserData (o novo tipo completo) de user.ts
import { UserData } from "@/types/user"; 

interface UseDashboardDataReturn {
    // 💡 CORREÇÃO 3: Usando UserData no lugar de UserProfile
    userData: UserData & { role: string } | null; 
    isLoading: boolean;
    pendingApprovalsCount: number;
    newWarnings: WarningMessage[];
    hasApprovalPermission: boolean;
    fetchProfile: () => Promise<void>;
    handleWarningClick: () => Promise<void>;
}

export const useDashboardData = (): UseDashboardDataReturn => {
    // 💡 CORREÇÃO 4: Usando UserData no lugar de UserProfile
    const [userData, setUserData] = useState<(UserData & { role: string }) | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);
    const [allWarnings, setAllWarnings] = useState<WarningMessage[]>([]);
    const [error, setError] = useState<string | null>(null);

    const { toast } = useToast();
    const navigate = useNavigate();

    // Nota: A role no userData virá do fetchUserProfile (que agora retorna UserData, mas é apelidada como UserProfile no arquivo de serviço antigo, faremos o cast).
    const userRole = userData?.role || '';
    const canApprove = useMemo(() => hasApprovalPermission(userRole), [userRole]);


    // 1. Busca de Aprovações Pendentes (separada para reuso)
    const fetchApprovalsCount = useCallback(async (role: string) => {
        if (!hasApprovalPermission(role)) {
             return { count: 0 };
        }
        try {
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
            // 💡 CORREÇÃO 5: O serviço retorna o UserData completo (que tem role), mas o tipo de retorno aqui deve ser UserData.
            const profile = await fetchUserProfile(); 
            // Faz o cast explícito aqui para garantir que o estado local tenha a tipagem correta, 
            // assumindo que fetchUserProfile (corrigido no próximo arquivo) retorna UserData com 'role'.
            setUserData(profile as UserData & { role: string });
            
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
    }, [toast, navigate, fetchApprovalsCount]); 

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