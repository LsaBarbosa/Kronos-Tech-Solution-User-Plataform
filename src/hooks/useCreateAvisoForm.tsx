import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastAction } from "@/components/ui/toast";
import { APP_PATHS } from "@/config/app-routes";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { fetchActiveEmployees, postMessage } from "@/service/message.service";
import type { EmployeeListItem } from "@/types/document";
import type { MessagePayload, MessagePriority } from "@/types/message";
import { safeLogger } from "@/utils/security/safeLogger";

type AvisoRole = "CTO" | "MANAGER" | "PARTNER" | "";

interface FormState {
  title: string;
  tipo: string;
  mensagem: string;
  filterTerm: string;
  selectedEmployeeIds: string[];
}

export interface UseCreateAvisoFormReturn {
  role: AvisoRole;
  formState: FormState;
  employees: EmployeeListItem[];
  filteredEmployees: EmployeeListItem[];
  isPosting: boolean;
  isFetchingEmployees: boolean;
  isAllVisibleSelected: boolean;
  isAllSelected: boolean;
  isPartner: boolean;
  isManager: boolean;
  isCto: boolean;
  isGlobalAudience: boolean;
  selectedCount: number;
  canSubmit: boolean;
  isFormValid: boolean;
  setTitle: (value: string) => void;
  setPriority: (value: MessagePriority) => void;
  setTipo: (value: string) => void;
  setMessageText: (value: string) => void;
  setMensagem: (value: string) => void;
  setEmployeeSearch: (value: string) => void;
  setFilterTerm: (value: string) => void;
  toggleEmployee: (employeeId: string) => void;
  toggleAllVisible: (checked: boolean) => void;
  handleSelectAll: (checked: boolean) => void;
  handleToggleEmployee: (employeeId: string) => void;
  submit: () => Promise<boolean>;
  handlePostar: () => Promise<boolean>;
}

const INITIAL_FORM_STATE: FormState = {
  title: "",
  tipo: "",
  mensagem: "",
  filterTerm: "",
  selectedEmployeeIds: [],
};

export const useCreateAvisoForm = (): UseCreateAvisoFormReturn => {
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [isFetchingEmployees, setIsFetchingEmployees] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { role } = useAuth();

  const currentRole = (role as AvisoRole) || "";
  const isCto = currentRole === "CTO";
  const isManager = currentRole === "MANAGER";
  const isPartner = currentRole === "PARTNER";

  useEffect(() => {
    if (!isManager) {
      setEmployees([]);
      return;
    }

    let cancelled = false;
    const loadEmployees = async () => {
      setIsFetchingEmployees(true);
      try {
        const response = await fetchActiveEmployees();
        if (!cancelled) {
          setEmployees(response);
        }
      } catch (error) {
        safeLogger.error("Erro ao carregar colaboradores ativos para avisos.", error);
        if (!cancelled) {
          toast({
            title: "Erro ao carregar colaboradores",
            description: "Nao foi possivel buscar a lista de colaboradores ativos.",
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) {
          setIsFetchingEmployees(false);
        }
      }
    };

    void loadEmployees();

    return () => {
      cancelled = true;
    };
  }, [isManager, toast]);

  const filteredEmployees = useMemo(() => {
    const search = formState.filterTerm.trim().toLowerCase();
    if (!search) {
      return employees;
    }

    return employees.filter((employee) =>
      employee.fullName.toLowerCase().includes(search)
    );
  }, [employees, formState.filterTerm]);

  const isAllVisibleSelected = useMemo(() => {
    if (filteredEmployees.length === 0) {
      return false;
    }

    return filteredEmployees.every((employee) =>
      formState.selectedEmployeeIds.includes(employee.employeeId)
    );
  }, [filteredEmployees, formState.selectedEmployeeIds]);

  const selectedCount = formState.selectedEmployeeIds.length;
  const isGlobalAudience = isCto;

  const canSubmit = useMemo(() => {
    const hasCoreFields =
      Boolean(formState.title.trim()) &&
      Boolean(formState.mensagem.trim()) &&
      Boolean(formState.tipo);

    if (!hasCoreFields || isPartner) {
      return false;
    }

    if (isCto) {
      return true;
    }

    return formState.selectedEmployeeIds.length > 0;
  }, [formState, isCto, isPartner]);

  const setTitle = useCallback((value: string) => {
    setFormState((current) => ({ ...current, title: value }));
  }, []);

  const setPriority = useCallback((value: MessagePriority) => {
    setFormState((current) => ({ ...current, tipo: value.toLowerCase() }));
  }, []);

  const setTipo = useCallback((value: string) => {
    setFormState((current) => ({ ...current, tipo: value }));
  }, []);

  const setMessageText = useCallback((value: string) => {
    setFormState((current) => ({ ...current, mensagem: value }));
  }, []);

  const setMensagem = useCallback((value: string) => {
    setFormState((current) => ({ ...current, mensagem: value }));
  }, []);

  const setEmployeeSearch = useCallback((value: string) => {
    setFormState((current) => ({ ...current, filterTerm: value }));
  }, []);

  const setFilterTerm = useCallback((value: string) => {
    setFormState((current) => ({ ...current, filterTerm: value }));
  }, []);

  const toggleEmployee = useCallback((employeeId: string) => {
    setFormState((current) => {
      const alreadySelected = current.selectedEmployeeIds.includes(employeeId);
      return {
        ...current,
        selectedEmployeeIds: alreadySelected
          ? current.selectedEmployeeIds.filter((id) => id !== employeeId)
          : [...current.selectedEmployeeIds, employeeId],
      };
    });
  }, []);

  const toggleAllVisible = useCallback((checked: boolean) => {
    setFormState((current) => {
      const selectedIds = new Set(current.selectedEmployeeIds);
      filteredEmployees.forEach((employee) => {
        if (checked) {
          selectedIds.add(employee.employeeId);
        } else {
          selectedIds.delete(employee.employeeId);
        }
      });

      return {
        ...current,
        selectedEmployeeIds: Array.from(selectedIds),
      };
    });
  }, [filteredEmployees]);

  const submit = useCallback(async () => {
    if (isPartner) {
      toast({
        title: "Acesso bloqueado",
        description: "Colaboradores nao podem criar avisos.",
        variant: "destructive",
      });
      return false;
    }

    if (!canSubmit) {
      toast({
        title: "Campos obrigatorios",
        description: isManager
          ? "Preencha titulo, mensagem, prioridade e selecione ao menos um colaborador."
          : "Preencha titulo, mensagem e prioridade antes de enviar o aviso global.",
        variant: "destructive",
      });
      return false;
    }

    setIsPosting(true);

    try {
      const payload: MessagePayload = {
        title: formState.title.trim(),
        messageText: formState.mensagem.trim(),
        priority: formState.tipo.toUpperCase() as MessagePriority,
        recipientEmployeeIds: isCto ? [] : formState.selectedEmployeeIds,
      };

      const result = await postMessage(payload);
      setFormState(INITIAL_FORM_STATE);

      toast({
        title: "Aviso criado",
        description: isCto
          ? `Envio global concluido${result ? ` para ${result.deliveredCount} usuarios ativos` : ""}.`
          : `Aviso enviado para ${formState.selectedEmployeeIds.length} colaborador(es).`,
        action: (
          <ToastAction altText="Ir para avisos" onClick={() => navigate(APP_PATHS.avisos)}>
            Ver avisos
          </ToastAction>
        ),
      });

      navigate(APP_PATHS.avisos);
      return true;
    } catch (error) {
      safeLogger.error("Erro ao criar aviso.", error);
      toast({
        title: "Erro ao criar aviso",
        description: "Nao foi possivel concluir o envio do aviso.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsPosting(false);
    }
  }, [canSubmit, formState, isCto, isManager, isPartner, navigate, toast]);

  const isFormValid = canSubmit;

  return {
    role: currentRole,
    formState,
    employees,
    filteredEmployees,
    isPosting,
    isFetchingEmployees,
    isAllVisibleSelected,
    isAllSelected: isAllVisibleSelected,
    isPartner,
    isManager,
    isCto,
    isGlobalAudience,
    selectedCount,
    canSubmit,
    isFormValid,
    setTitle,
    setPriority,
    setTipo,
    setMessageText,
    setMensagem,
    setEmployeeSearch,
    setFilterTerm,
    toggleEmployee,
    toggleAllVisible,
    handleSelectAll: toggleAllVisible,
    handleToggleEmployee: toggleEmployee,
    submit,
    handlePostar: submit,
  };
};
