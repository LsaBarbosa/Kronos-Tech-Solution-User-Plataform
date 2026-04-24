import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, isBefore, isSameDay } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  TimeOffFormState,
  IManagerOption,
  RequestTimeOffRequestPayload,
  TimeOffRequestType,
} from "../types/vacation";
import { requestTimeOff, fetchManagerOptions } from "../service/records.service";
import { getServiceErrorMessage } from "@/service/helpers/service-error.helper";

type TimeOffFormErrors = Partial<Record<keyof TimeOffFormState, string>>;

// ATUALIZADO: Default agora inclui requestType
const defaultFormState: TimeOffFormState = {
  startDate: undefined,
  endDate: undefined,
  startHour: "09:00",
  endHour: "18:00",
  managerId: "",
  document: null,
  requestType: "FORGOTTEN_REGISTRATION", // Padrão é Abono
};

export const useRequestManualRegistration = () => {
  const { toast } = useToast();
  const [formState, setFormState] = useState<TimeOffFormState>(defaultFormState);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<TimeOffFormErrors>({});

  const managersQuery = useQuery<IManagerOption[]>({
    queryKey: ["managerOptions"],
    queryFn: fetchManagerOptions,
  });

  useEffect(() => {
    if (!managersQuery.error) return;
    console.error("Erro ao carregar managers:", managersQuery.error);
    toast({
      title: "Erro ao carregar",
      description: getServiceErrorMessage(
        managersQuery.error,
        "Não foi possível carregar a lista de gestores. Tente novamente."
      ),
      variant: "destructive",
    });
  }, [managersQuery.error, toast]);

  const validateForm = (): boolean => {
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
      // CORREÇÃO AQUI:
      // O Java espera "FORGOTTEN_REGISTRATION" ou "TIME_OFF_REQUEST"
      const backendType: TimeOffRequestType = formState.requestType;

      const payload: RequestTimeOffRequestPayload = { 
        startDate: format(formState.startDate!, "dd-MM-yyyy"),
        endDate: format(formState.endDate!, "dd-MM-yyyy"),
        startHour: formState.startHour,
        endHour: formState.endHour,
        managerId: formState.managerId,
        type: backendType, // Agora envia o valor que o Java entende
      };

      await requestTimeOff(payload, formState.document);

      const message = formState.requestType === 'FORGOTTEN_REGISTRATION' 
        ? 'Solicitação de esquecimento enviada!' 
        : 'Solicitação de abono enviada!';

      toast({
        title: "Sucesso!",
        description: message,
      });

      setFormState(defaultFormState);
      setErrors({});
    } catch (error) {
      console.error("Erro ao solicitar:", error);
      const errorMessage = getServiceErrorMessage(
        error,
        "Não foi possível processar a solicitação."
      );
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
        const newErrors = { ...prev } as TimeOffFormErrors; 
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  return {
    formState,
    managers: managersQuery.data ?? [],
    isLoading,
    errors,
    handleChange,
    handleSubmit,
  };
};
