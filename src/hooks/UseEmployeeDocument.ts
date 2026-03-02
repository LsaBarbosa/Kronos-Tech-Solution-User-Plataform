// src/hooks/useEmployeeDocuments.ts

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Document, EmployeeListItem } from "@/types/document";
import { fetchEmployeeDocuments, fetchEmployeesForSelection } from "@/service/document.Service";

interface UseEmployeeDocumentsReturn {
    employees: EmployeeListItem[];
    documents: Document[];
    selectedEmployeeId: string;
    isLoading: boolean;
    isFetchingEmployees: boolean;
    error: string | null;
    setSelectedEmployeeId: (id: string) => void;
    handleFetchDocuments: (employeeId: string) => Promise<void>;
}

export const useEmployeeDocuments = (): UseEmployeeDocumentsReturn => {
    const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingEmployees, setIsFetchingEmployees] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const { toast } = useToast();
    const navigate = useNavigate();

    // 1. Busca a lista de colaboradores (executa apenas na montagem)
    useEffect(() => {
        const loadEmployees = async () => {
            setIsFetchingEmployees(true);
            try {
                const data = await fetchEmployeesForSelection(); // 💡 Chama o Serviço
                setEmployees(data);
                if (data.length > 0) {
                     // Não seleciona automaticamente o primeiro, mantém o padrão do Select
                }
            } catch (err: any) {
                setError(err.message);
                if (err.message.includes("Token")) navigate("/login");
                toast({ title: "Erro", description: err.message, variant: "destructive" });
            } finally {
                setIsFetchingEmployees(false);
            }
        };
        loadEmployees();
    }, [toast, navigate]);

    // 2. Handler para buscar documentos do colaborador selecionado
    const handleFetchDocuments = useCallback(async (employeeId: string) => {
        if (!employeeId) return;
        
        setIsLoading(true);
        setError(null);
        setDocuments([]); // Limpa documentos anteriores
        
        try {
            const data = await fetchEmployeeDocuments(employeeId); // 💡 Chama o Serviço
            setDocuments(data);
            
            toast({
                title: "Sucesso",
                description: `${data.length} documentos encontrados para o colaborador.`,
            });
        } catch (err: any) {
            setError(err.message);
            toast({ title: "Erro", description: err.message || "Falha ao carregar documentos.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);
    
    // 3. Efeito para buscar automaticamente quando o ID muda (opcional, mas prático)
    useEffect(() => {
        if (selectedEmployeeId) {
            handleFetchDocuments(selectedEmployeeId);
        } else {
            setDocuments([]); // Limpa se nada estiver selecionado
        }
    }, [selectedEmployeeId, handleFetchDocuments]);

    return {
        employees,
        documents,
        selectedEmployeeId,
        isLoading,
        isFetchingEmployees,
        error,
        setSelectedEmployeeId,
        handleFetchDocuments,
    };
};