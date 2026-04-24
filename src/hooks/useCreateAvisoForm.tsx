// src/hooks/useCreateAvisoForm.ts

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast"; // Importado como componente
import { MessagePayload, MessagePriority } from "@/types/message";
import { EmployeeListItem } from "@/types/employee";
import { fetchActiveEmployees, postMessage } from "@/service/message.service"

interface FormState {
    title: string;
    tipo: string; // "normal", "alert", "critical"
    mensagem: string;
    filterTerm: string;
    selectedEmployeeIds: string[];
}

interface UseCreateAvisoFormReturn {
    // Estados de Dados
    formState: FormState;
    employees: EmployeeListItem[];
    filteredEmployees: EmployeeListItem[];
    // Estados de UI
    isPosting: boolean;
    isFetchingEmployees: boolean;
    isAllSelected: boolean;
    isFormValid: boolean;
    // Setters
    setTitle: (title: string) => void;
    setTipo: (tipo: string) => void;
    setMensagem: (mensagem: string) => void;
    setFilterTerm: (term: string) => void;
    // Handlers de Ação
    handleSelectAll: (checked: boolean) => void;
    handleToggleEmployee: (employeeId: string) => void;
    handlePostar: () => Promise<void>;
}

export const useCreateAvisoForm = (): UseCreateAvisoFormReturn => { // 💡 CORREÇÃO 1: Tipo de retorno definido aqui
    const [formState, setFormState] = useState<FormState>({
        title: "",
        tipo: "",
        mensagem: "",
        filterTerm: "",
        selectedEmployeeIds: [],
    });
    
    // Desestruturação de formState para uso no hook (dependências, etc.)
    const { title, tipo, mensagem, filterTerm, selectedEmployeeIds } = formState;

    const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
    const [isPosting, setIsPosting] = useState(false);
    const [isFetchingEmployees, setIsFetchingEmployees] = useState(false);
    
    const { toast } = useToast();
    const navigate = useNavigate();

    // --- Setters para o componente ---
    const setTitle = useCallback((newTitle: string) => setFormState(prev => ({ ...prev, title: newTitle })), []);
    const setTipo = useCallback((newTipo: string) => setFormState(prev => ({ ...prev, tipo: newTipo })), []);
    const setMensagem = useCallback((newMensagem: string) => setFormState(prev => ({ ...prev, mensagem: newMensagem })), []);
    const setFilterTerm = useCallback((newTerm: string) => setFormState(prev => ({ ...prev, filterTerm: newTerm })), []);

    // --- Lógica de Filtragem e Validação (useMemo para performance) ---

    const filteredEmployees = useMemo(() => {
        if (!employees) return [];
        return employees.filter(employee =>
            employee.fullName.toLowerCase().includes(filterTerm.toLowerCase())
        );
    }, [employees, filterTerm]);
    
    const isAllSelected = useMemo(() => {
        if (filteredEmployees.length === 0) return false;
        const filteredIds = filteredEmployees.map(emp => emp.employeeId);
        return filteredIds.every(id => selectedEmployeeIds.includes(id));
    }, [filteredEmployees, selectedEmployeeIds]);
    
    const isFormValid = useMemo(() => {
        return !!tipo && !!title.trim() && !!mensagem.trim();
    }, [tipo, title, mensagem]);


    // --- FUNÇÕES DE API ORQUESTRADAS ---

    const loadEmployees = useCallback(async () => {
        setIsFetchingEmployees(true);
        try {
            const data = await fetchActiveEmployees(); 
            setEmployees(data);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Não foi possível carregar a lista de colaboradores para seleção.";
            console.error("Erro ao buscar colaboradores:", error);
            toast({
                title: "Atenção",
                description: message,
                variant: "destructive",
            });
        } finally {
            setIsFetchingEmployees(false);
        }
    }, [toast]);
    
    useEffect(() => {
        loadEmployees();
    }, [loadEmployees]);


    // --- HANDLERS DE SELEÇÃO ---

    const handleSelectAll = useCallback((checked: boolean) => {
        setFormState(prev => {
            const newIds = new Set(prev.selectedEmployeeIds);
            const filteredIds = filteredEmployees.map(emp => emp.employeeId);

            if (checked) {
                filteredIds.forEach(id => newIds.add(id));
            } else {
                filteredIds.forEach(id => newIds.delete(id));
            }
            return { ...prev, selectedEmployeeIds: Array.from(newIds) };
        });
    }, [filteredEmployees]); 

    const handleToggleEmployee = useCallback((employeeId: string) => {
        setFormState(prev => ({
            ...prev,
            selectedEmployeeIds: prev.selectedEmployeeIds.includes(employeeId)
                ? prev.selectedEmployeeIds.filter(id => id !== employeeId)
                : [...prev.selectedEmployeeIds, employeeId]
        }));
    }, []);


    // --- FUNÇÃO DE SUBMISSÃO ---
    
    const handlePostar = useCallback(async (): Promise<void> => {
        if (!isFormValid) {
             toast({
                title: "Erro de Validação",
                description: "Por favor, preencha o Título, o Tipo e a Mensagem do aviso.",
                variant: "destructive",
              });
              return;
        }

        setIsPosting(true);

        try {
            const payload: MessagePayload = {
                title: title.trim(),
                messageText: mensagem.trim(),
                priority: tipo.toUpperCase() as MessagePriority,
                recipientEmployeeIds: selectedEmployeeIds.filter(Boolean),
            };

            await postMessage(payload); 

            const recipientCount = selectedEmployeeIds.length;
            let toastDescription = "";
            if (recipientCount === 0) {
                toastDescription = "O aviso foi criado e está visível apenas para você (Remetente).";
            } else {
                toastDescription = `O aviso foi postado com sucesso para ${recipientCount} destinatário(s).`;
            }

            // Sucesso e Limpeza do estado
            setFormState({
                title: "",
                tipo: "",
                mensagem: "",
                filterTerm: "",
                selectedEmployeeIds: [],
            });
            
            // 💡 CORREÇÃO 2: Uso correto do ToastAction como componente JSX
            toast({
                title: "Aviso criado",
                description: toastDescription,
                action: (
                    <ToastAction altText="Ir para avisos" onClick={() => navigate("/avisos")}>
                        Ir para Avisos
                    </ToastAction>
                ),
            });

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Ocorreu um erro ao postar o aviso.";
            console.error("Erro ao postar aviso:", error);
            toast({
                title: "Erro",
                description: message,
                variant: "destructive",
            });
        } finally {
            setIsPosting(false);
        }
    }, [isFormValid, title, mensagem, tipo, selectedEmployeeIds, toast, navigate]);


    return {
        // Dados e Estados (Retorno explícito da função)
        formState,
        employees,
        filteredEmployees,
        isPosting,
        isFetchingEmployees,
        isAllSelected,
        isFormValid,
        // Setters para o componente
        setTitle,
        setTipo,
        setMensagem,
        setFilterTerm,
        // Handlers de Ação
        handleSelectAll,
        handleToggleEmployee,
        handlePostar,
    };
};
