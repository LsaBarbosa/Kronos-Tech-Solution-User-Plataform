// src/hooks/useEmployeeList.ts

import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { EmployeeData, formatCPF } from "@/types/employee";
import { fetchEmployeeList, toggleEmployeeStatus, deleteEmployee } from "@/service/employee.Service";

interface EmployeeListState {
    colaboradores: EmployeeData[];
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;
    searchTerm: string;
    filterRole: string;
    filterStatus: string;
}

interface UseEmployeeListReturn extends EmployeeListState {
    filteredColaboradores: EmployeeData[];
    setSearchTerm: (term: string) => void;
    setFilterRole: (role: string) => void;
    setFilterStatus: (status: string) => void;
    handleToggleStatus: (colaborador: EmployeeData) => Promise<void>;
    handleDelete: (employeeId: string, name: string) => Promise<void>;
    clearFilters: () => void;
    refetchList: () => Promise<void>;
    formatCPF: (cpf: string) => string;
}

export const useEmployeeList = (): UseEmployeeListReturn => {
    const [state, setState] = useState<EmployeeListState>({
        colaboradores: [],
        isLoading: true,
        isSubmitting: false,
        error: null,
        searchTerm: "",
        filterRole: "all",
        filterStatus: "all",
    });

    const { toast } = useToast();
    const navigate = useNavigate();

    // 1. Busca de Dados
    const refetchList = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const data = await fetchEmployeeList(); // 💡 Chama o Serviço
            setState(prev => ({ ...prev, colaboradores: data }));
        } catch (error: any) {
            setState(prev => ({ ...prev, error: error.message || "Falha ao carregar lista." }));
            if (error.message.includes("Token")) navigate("/login");
        } finally {
            setState(prev => ({ ...prev, isLoading: false }));
        }
    }, [navigate]);

    useEffect(() => {
        refetchList();
    }, [refetchList]);

    // 2. Lógica de Filtro (useMemo)
    const filteredColaboradores = useMemo(() => {
        let list = state.colaboradores;
        const term = state.searchTerm.toLowerCase();

        // Filtro por termo de busca
        if (term) {
            list = list.filter(c =>
                c.fullName.toLowerCase().includes(term) ||
                c.cpf.includes(term) ||
                c.email.toLowerCase().includes(term)
            );
        }

        // Filtro por cargo (Role)
        if (state.filterRole !== "all") {
            list = list.filter(c => c.role === state.filterRole);
        }

        // Filtro por status (Active)
        if (state.filterStatus !== "all") {
            const activeStatus = state.filterStatus === "active";
            list = list.filter(c => c.active === activeStatus);
        }

        return list;
    }, [state.colaboradores, state.searchTerm, state.filterRole, state.filterStatus]);
    
    // 3. Handlers de Ação

    const handleToggleStatus = useCallback(async (colaborador: EmployeeData) => {
        if (state.isSubmitting) return;

        setState(prev => ({ ...prev, isSubmitting: true }));
        try {
            await toggleEmployeeStatus(colaborador.id, colaborador.active); // 💡 Chama o Serviço

            // Atualização otimista do estado local
            setState(prev => ({
                ...prev,
                colaboradores: prev.colaboradores.map(c => 
                    c.id === colaborador.id ? { ...c, active: !c.active } : c
                )
            }));

            toast({ title: "Sucesso", description: `Status de ${colaborador.fullName} alterado.` });
        } catch (error: any) {
            toast({ title: "Erro", description: error.message || "Falha ao alterar status.", variant: "destructive" });
        } finally {
            setState(prev => ({ ...prev, isSubmitting: false }));
        }
    }, [state.isSubmitting, toast]);
    
    const handleDelete = useCallback(async (employeeId: string, name: string) => {
        if (state.isSubmitting) return;
        
        // Substitua por um modal de confirmação real
        if (!window.confirm(`Tem certeza que deseja DELETAR o colaborador ${name}?`)) {
            return;
        }

        setState(prev => ({ ...prev, isSubmitting: true }));
        try {
            await deleteEmployee(employeeId); // 💡 Chama o Serviço

            // Remove da lista localmente
            setState(prev => ({
                ...prev,
                colaboradores: prev.colaboradores.filter(c => c.id !== employeeId)
            }));
            
            toast({ title: "Sucesso", description: `Colaborador ${name} deletado permanentemente.` });
        } catch (error: any) {
            toast({ title: "Erro", description: error.message || "Falha ao deletar colaborador.", variant: "destructive" });
        } finally {
            setState(prev => ({ ...prev, isSubmitting: false }));
        }
    }, [state.isSubmitting, toast]);
    
    const clearFilters = useCallback(() => {
        setState(prev => ({ ...prev, searchTerm: "", filterRole: "all", filterStatus: "all" }));
    }, []);

    return {
        ...state,
        filteredColaboradores,
        setSearchTerm: term => setState(prev => ({ ...prev, searchTerm: term })),
        setFilterRole: role => setState(prev => ({ ...prev, filterRole: role })),
        setFilterStatus: status => setState(prev => ({ ...prev, filterStatus: status })),
        handleToggleStatus,
        handleDelete,
        clearFilters,
        refetchList,
        formatCPF, // Exporta a função utilitária
    };
};