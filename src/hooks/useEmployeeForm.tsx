// src/hooks/useEmployeeForm.ts

import { useState, useEffect, useCallback, useRef } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
// 💡 CORREÇÃO 4: Importa EmployeeCreationPayload do types
import { CompanyListItem, EmployeeFormType, employeeSchema, cleanNumberString, EmployeeCreationPayload } from "@/types/employee";
import { checkUsernameAvailability, fetchCompanyList, createPartner, createManager } from "@/service/employee.Service";

type RoleType = 'PARTNER' | 'MANAGER';
type UsernameStatus = 'checking' | 'available' | 'unavailable' | 'idle';

interface UseEmployeeFormReturn {
    // Estados de Dados e UI
    form: UseFormReturn<EmployeeFormType>;
    companies: CompanyListItem[];
    step: number;
    isSubmitting: boolean;
    isLoadingCompanies: boolean;
    usernameAvailability: UsernameStatus;
    // Handlers
    setStep: (step: number) => void;
    checkUsername: (username: string) => void;
    onSubmit: (role: RoleType) => (data: EmployeeFormType) => Promise<void>;
    handleGoBack: () => void;
}

export const useEmployeeForm = (): UseEmployeeFormReturn => {
    const form = useForm<EmployeeFormType>({
        resolver: zodResolver(employeeSchema),
        defaultValues: {
            name: "",
            cpf: "",
            email: "",
            phoneNumber: "",
            salary: 0,
            jobTitle: "",
            pis: "",
            companyId: "",
            homeOffice: "false", // Valor inicial de string para o Select
            username: "",
            password: "",
            confirmPassword: "",
        },
    });

    const [step, setStep] = useState(1);
    const [companies, setCompanies] = useState<CompanyListItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
    const [usernameAvailability, setUsernameAvailability] = useState<UsernameStatus>('idle');

    const { toast } = useToast();
    const navigate = useNavigate();

    // 1. Busca de Empresas
    const loadCompanies = useCallback(async () => {
        setIsLoadingCompanies(true);
        try {
            const data = await fetchCompanyList();
            setCompanies(data);
        } catch (error: any) {
            toast({ title: "Erro", description: error.message || "Falha ao carregar a lista de empresas.", variant: "destructive" });
        } finally {
            setIsLoadingCompanies(false);
        }
    }, [toast]);

    useEffect(() => {
        loadCompanies();
    }, [loadCompanies]);

    // 2. Checagem de Username (com debounce simulado)
    const checkUsername = useCallback(async (username: string) => {
        if (username.length < 5) {
            setUsernameAvailability('idle');
            return;
        }
        
        setUsernameAvailability('checking');
        try {
            const isAvailable = await checkUsernameAvailability(username);
            setUsernameAvailability(isAvailable ? 'available' : 'unavailable');
        } catch (error) {
             setUsernameAvailability('unavailable');
        }
    }, []);

    // 3. Submissão do Formulário (Curried function para reutilização)
    const onSubmit = (role: RoleType) => async (data: EmployeeFormType) => {
        if (usernameAvailability !== 'available') {
            toast({ title: "Erro de Acesso", description: "O username não está disponível.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            // 💡 CORREÇÃO 5: Criação do payload com conversão de string para boolean
            const payload: EmployeeCreationPayload = {
                ...data,
                homeOffice: data.homeOffice === "true", // Converte a string 'true'/'false' em boolean
                salary: Number(data.salary), // Garante que o salário é number
                role: role,
            } as EmployeeCreationPayload; // Força o tipo final

            if (role === 'PARTNER') {
                await createPartner(payload);
            } else {
                await createManager(payload);
            }

            toast({
                title: "Sucesso!",
                description: `${role === 'PARTNER' ? 'Colaborador' : 'Gestor'} ${data.name} criado com sucesso.`,
                action: <ToastAction altText="Lista de colaboradores" onClick={() => navigate("/lista-colaboradores")}>Ver Lista</ToastAction>,
            });

            // Limpa o formulário e volta ao passo 1
            form.reset();
            setStep(1);
        } catch (error: any) {
            console.error("Erro na criação:", error);
            toast({
                title: "Erro na Criação",
                description: error.message || "Falha ao criar o usuário.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // 4. Navegação
    const handleGoBack = () => {
        if (step === 2) {
            setStep(1);
        } else {
            navigate("/dashboard"); // Volta para o dashboard se estiver no passo 1
        }
    };

    return {
        form,
        companies,
        step,
        isSubmitting,
        isLoadingCompanies,
        usernameAvailability,
        setStep,
        checkUsername,
        onSubmit,
        handleGoBack,
    };
};
