// src/hooks/useDashboardData.ts

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { fetchUserProfile, fetchPendingApprovalsCount, fetchAllWarnings, updateLastSeenMessageTimestamp } from "@/service/dashboard.service";
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

    // 1. Busca do Perfil e Contadores
    const fetchProfile = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const profile = await fetchUserProfile(); // 💡 Chama o Serviço
            setUserData(profile);
            
            // Busca dados secundários (Contagem e Avisos)
            const [approvals, warnings] = await Promise.all([
                hasApprovalPermission(profile.role) ? fetchPendingApprovalsCount() : Promise.resolve({ count: 0 }),
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
    }, [toast, navigate]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);
    
    // 2. Lógica para filtrar novos avisos (useMemo)
    const newWarnings = useMemo(() => {
        if (!userData?.lastSeenMessageTimestamp) {
            // Se nunca viu, todos são novos
            return allWarnings; 
        }
        const lastSeen = new Date(userData.lastSeenMessageTimestamp).getTime();
        
        // Filtra avisos criados DEPOIS do último timestamp de visualização
        return allWarnings.filter(warning => 
            new Date(warning.createdAt).getTime() > lastSeen
        );
    }, [allWarnings, userData]);
    
    // 3. Handler para clicar no aviso (Atualiza timestamp no backend)
    const handleWarningClick = useCallback(async () => {
        // Redireciona imediatamente
        navigate("/avisos"); 

        if (newWarnings.length > 0) {
            const now = new Date().toISOString();
            
            try {
                await updateLastSeenMessageTimestamp(now); // 💡 Chama o Serviço
                
                // Atualiza o estado localmente para remover o contador
                setUserData(prev => prev ? { ...prev, lastSeenMessageTimestamp: now } : null);
                setPendingApprovalsCount(0); // Limpa o contador no dashboard imediatamente
                
            } catch (err: any) {
                // Se falhar, notifica o usuário, mas o redirecionamento já ocorreu
                toast({ 
                    title: "Atenção", 
                    description: "Falha ao registrar a visualização dos avisos.", 
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
        hasApprovalPermission: hasApprovalPermission(userData?.role || ''),
        fetchProfile, // Exporta para que o EmployeeBadge possa atualizar o perfil
        handleWarningClick,
    };
};