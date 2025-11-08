// src/hooks/useRequestTimeOff.ts

import { useState, useEffect } from "react";
import { format, isBefore, isSameDay } from "date-fns";
import { useToast } from "../components/ui/use-toast";
import { UserAccountData } from "../types/user"; 
import {
  RequestTimeOffRequestPayload,
  TimeOffFormState,
} from "../types/vacation";
import { listUsers } from "../service/user.Service"; 
import { requestTimeOff } from "../service/vacation.service";

// 1. NOVO TIPO: Define que o objeto de erros usará chaves de TimeOffFormState,
// mas os valores serão strings de mensagem de erro.
type TimeOffFormErrors = Partial<Record<keyof TimeOffFormState, string>>;

const defaultFormState: TimeOffFormState = {
  startDate: undefined,
  endDate: undefined,
  startHour: "09:00",
  endHour: "18:00",
  managerId: "",
  document: null,
};


export const useRequestTimeOff = () => {
  const { toast } = useToast();
  const [formState, setFormState] = useState<TimeOffFormState>(defaultFormState);
  
  const [managers, setManagers] = useState<UserAccountData[]>([]); 
  const [isLoading, setIsLoading] = useState(false);
  
  // 2. APLICAÇÃO DO NOVO TIPO
  const [errors, setErrors] = useState<TimeOffFormErrors>({});

  // 1. Busca os Managers disponíveis
  // ... (Lógica de useEffect inalterada)
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const allUsers = await listUsers(true); 
        setManagers(allUsers.filter((user) => user.role === "MANAGER"));
      } catch (error) {
        console.error("Erro ao carregar managers:", error);
        toast({
          title: "Erro ao carregar",
          description:
            "Não foi possível carregar a lista de gestores. Tente novamente.",
          variant: "destructive",
        });
      }
    };
    fetchManagers();
  }, [toast]);

  // 2. Lógica de Validação do Formulário
  const validateForm = (): boolean => {
    // 3. APLICAÇÃO DO NOVO TIPO: newErrors agora aceita strings de erro
    const newErrors: TimeOffFormErrors = {};

    if (!formState.startDate) {
      newErrors.startDate = "A data de início é obrigatória";
    }
    if (!formState.endDate) {
      newErrors.endDate = "A data de fim é obrigatória";
    }
    if (!formState.managerId) {
      newErrors.managerId = "A seleção do gestor é obrigatória";
    }

    // Validação de Lógica de Datas/Horas (o tipo Date é garantido pelo if)
    if (formState.startDate && formState.endDate) {
      if (isBefore(formState.endDate, formState.startDate)) {
        newErrors.endDate = "A data de fim não pode ser anterior à data de início";
      } else if (isSameDay(formState.startDate, formState.endDate)) {
        const [startH, startM] = formState.startHour.split(":").map(Number);
        const [endH, endM] = formState.endHour.split(":").map(Number);
        const startTime = startH * 60 + startM;
        const endTime = endH * 60 + endM;

        if (endTime <= startTime) {
          newErrors.endHour = "A hora de fim deve ser posterior à hora de início no mesmo dia";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ... (Restante do código do hook, com pequenos ajustes de tipagem em handleChange)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) {
      toast({
        title: "Validação",
        description: "Preencha todos os campos obrigatórios corretamente.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload: RequestTimeOffRequestPayload = {
        startDate: format(formState.startDate!, "dd-MM-yyyy"),
        endDate: format(formState.endDate!, "dd-MM-yyyy"),
        startHour: formState.startHour,
        endHour: formState.endHour,
        managerId: formState.managerId,
      };

      const createdId = await requestTimeOff(payload, formState.document);

      toast({
        title: "Sucesso!",
        description: `Solicitação de abono criada com sucesso. ID: ${createdId}.`,
      });

      setFormState(defaultFormState);
      setErrors({});
    } catch (error) {
      console.error("Erro ao solicitar abono:", error);
      const errorMessage = (error as Error).message || "Não foi possível processar a solicitação de abono. Verifique se não há conflitos de registro.";
      toast({
        title: "Erro na Solicitação",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = <K extends keyof TimeOffFormState>(
    key: K,
    value: TimeOffFormState[K]
  ) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        // Cast necessário ao deletar para garantir que o objeto está sendo tratado como TimeOffFormErrors
        const newErrors = { ...prev } as TimeOffFormErrors; 
        delete newErrors[key];
        return newErrors;
      });
    }
  };


  return {
    formState,
    managers,
    isLoading,
    errors,
    handleChange,
    handleSubmit,
  };
};