import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { fetchReportEmployees } from "@/service/records.service";
import { FiscalService } from "@/service/fiscal.service";
import { getServiceErrorMessage } from "@/service/helpers/service-error.helper";
import { getAdministrativeErrorMessage } from "@/service/helpers/admin-error-message.helper";
import { dateToBackendDatePattern } from "@/utils/date-format";
import type { Employee } from "@/utils/report-utils";

export interface EspelhoPontoViewModel {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  employees: Employee[];
  selectedEmployeeId: string;
  setSelectedEmployeeId: (id: string) => void;
  isLoading: boolean;
  isLoadingEmployees: boolean;
  canSelectEmployee: boolean;
  referenceLabel: string;
  selectedEmployeeLabel: string;
  handleDownload: () => Promise<void>;
}

export const useEspelhoPontoViewModel = (): EspelhoPontoViewModel => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  const { toast } = useToast();
  const { status: authStatus, role } = useAuth();
  const canSelectEmployee = role === "MANAGER" || role === "CTO";

  useEffect(() => {
    if (authStatus !== "authenticated" || !canSelectEmployee) {
      setEmployees([]);
      setSelectedEmployeeId("");
      return;
    }

    let isActive = true;

    const loadEmployees = async () => {
      setIsLoadingEmployees(true);

      try {
        const data = await fetchReportEmployees(true);
        if (isActive) {
          setEmployees(data);
        }
      } catch (error) {
        console.error("Erro ao carregar colaboradores para o espelho de ponto:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: getServiceErrorMessage(
            error,
            "Não foi possível carregar a lista de colaboradores."
          ),
        });
      } finally {
        if (isActive) {
          setIsLoadingEmployees(false);
        }
      }
    };

    void loadEmployees();

    return () => {
      isActive = false;
    };
  }, [authStatus, canSelectEmployee, toast]);

  const handleDownload = useCallback(async () => {
    if (!date) {
      toast({
        variant: "destructive",
        title: "Data inválida",
        description: "Por favor, selecione um mês de referência.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const year = date.getFullYear();
      const month = date.getMonth();
      const startDate = dateToBackendDatePattern(new Date(year, month, 1));
      const endDate = dateToBackendDatePattern(new Date(year, month + 1, 0));
      const targetEmployeeId =
        canSelectEmployee && selectedEmployeeId ? selectedEmployeeId : undefined;

      toast({
        title: "Gerando Relatório",
        description: "Baixando espelho de ponto...",
      });

      await FiscalService.downloadMirror(startDate, endDate, targetEmployeeId);

      toast({
        title: "Sucesso!",
        description: "Arquivo PDF baixado com sucesso.",
        variant: "default",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro no Download",
        description: getAdministrativeErrorMessage(error, "fiscal"),
      });
    } finally {
      setIsLoading(false);
    }
  }, [canSelectEmployee, date, selectedEmployeeId, toast]);

  const referenceLabel = useMemo(
    () => (date ? format(date, "MMMM 'de' yyyy", { locale: ptBR }) : "Selecione um mês"),
    [date]
  );

  const selectedEmployeeLabel = useMemo(() => {
    if (!canSelectEmployee) return "Próprio espelho";
    if (!selectedEmployeeId) return "Espelho próprio (sem colaborador selecionado)";
    return employees.find((employee) => employee.employeeId === selectedEmployeeId)?.fullName ??
      "Colaborador selecionado";
  }, [canSelectEmployee, employees, selectedEmployeeId]);

  return {
    date,
    setDate,
    employees,
    selectedEmployeeId,
    setSelectedEmployeeId,
    isLoading,
    isLoadingEmployees,
    canSelectEmployee,
    referenceLabel,
    selectedEmployeeLabel,
    handleDownload,
  };
};
