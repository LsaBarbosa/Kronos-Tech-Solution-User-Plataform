import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import {
  fetchDetailedReport,
  fetchReportEmployees,
  toggleRecordActivate,
  updateRecordStatus,
} from "@/service/records.service";
import type { DetailedReportItem, Employee } from "@/utils/report-utils";
import {
  formatDateForBackend,
  TARGET_STATUS_VALUES,
  type TargetStatus,
} from "./status-registro-helpers";
import { safeLogger } from "@/utils/security/safeLogger";

export type DecisionAction = "save" | "toggle";

export interface StatusRegistroViewModel {
  // session
  isPartner: boolean;

  // filters
  employees: Employee[];
  selectedEmployee: string;
  setSelectedEmployee: (value: string) => void;
  employeeActive: "active" | "inactive";
  setEmployeeActive: (value: "active" | "inactive") => void;
  selectedDates: Date[];
  setSelectedDates: (dates: Date[]) => void;
  searchStatuses: string[];
  toggleSearchStatus: (status: string) => void;
  setSearchStatuses: (values: string[]) => void;
  isActiveFilter: boolean;
  setIsActiveFilter: (value: boolean) => void;

  // results
  records: DetailedReportItem[];
  selectedRecord: DetailedReportItem | null;
  selectRecord: (record: DetailedReportItem) => void;

  // decision
  newStatus: TargetStatus | "";
  setNewStatus: (value: TargetStatus | "") => void;

  // ui state
  isLoadingEmployees: boolean;
  isSearching: boolean;
  isSavingStatus: boolean;
  isTogglingActivate: boolean;
  hasSearched: boolean;

  // actions
  search: () => Promise<void>;
  clearFilters: () => void;
  requestSaveStatus: () => void;
  requestToggleActivate: () => void;
  cancelDecision: () => void;
  confirmDecision: () => Promise<void>;
  pendingDecision: DecisionAction | null;
}

const ALL_TARGETS: readonly string[] = TARGET_STATUS_VALUES;

export const useStatusRegistroViewModel = (): StatusRegistroViewModel => {
  const { toast } = useToast();
  const { status: authStatus, role, user } = useAuth();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [employeeActive, setEmployeeActive] = useState<"active" | "inactive">("active");
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [searchStatuses, setSearchStatuses] = useState<string[]>(["CREATED"]);
  const [isActiveFilter, setIsActiveFilter] = useState(true);

  const [records, setRecords] = useState<DetailedReportItem[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState<TargetStatus | "">("");
  const [hasSearched, setHasSearched] = useState(false);

  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isTogglingActivate, setIsTogglingActivate] = useState(false);
  const [pendingDecision, setPendingDecision] = useState<DecisionAction | null>(null);

  const isPartner = role === "PARTNER";

  // Load employees
  useEffect(() => {
    if (authStatus !== "authenticated") return;

    const userId = user?.profile?.employeeId || user?.account.employeeId || "";
    const userName = user?.profile?.fullName || "";

    if (isPartner) {
      setEmployees([{ employeeId: userId, fullName: userName }]);
      setSelectedEmployee(userId);
      return;
    }

    let cancelled = false;
    setIsLoadingEmployees(true);

    fetchReportEmployees(employeeActive === "active")
      .then((data) => {
        if (cancelled) return;
        setEmployees(data);
        setSelectedEmployee((current) => {
          if (current && data.some((emp) => emp.employeeId === current)) {
            return current;
          }
          return data[0]?.employeeId ?? "";
        });
      })
      .catch((error) => {
        if (cancelled) return;
        safeLogger.error("Erro ao buscar funcionários:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os colaboradores.",
          variant: "destructive",
        });
      })
      .finally(() => {
        if (!cancelled) setIsLoadingEmployees(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authStatus, employeeActive, isPartner, toast, user]);

  const selectedRecord = useMemo(() => {
    if (selectedRecordId === null) return null;
    return records.find((item) => item.timeRecordId === selectedRecordId) ?? null;
  }, [records, selectedRecordId]);

  const toggleSearchStatus = useCallback((status: string) => {
    setSearchStatuses((current) =>
      current.includes(status) ? current.filter((value) => value !== status) : [...current, status]
    );
  }, []);

  const selectRecord = useCallback((record: DetailedReportItem) => {
    setSelectedRecordId(record.timeRecordId ?? null);
    setNewStatus("");
  }, []);

  const search = useCallback(async () => {
    if (searchStatuses.length === 0) {
      toast({
        title: "Selecione um status",
        description: "Escolha pelo menos um status para buscar registros.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    try {
      const data = await fetchDetailedReport({
        reference: "08:00",
        active: isActiveFilter,
        statuses: searchStatuses,
        dates: selectedDates.map(formatDateForBackend),
        employeeId: selectedEmployee || undefined,
      });

      setRecords(data);
      setSelectedRecordId(data[0]?.timeRecordId ?? null);
      setNewStatus("");

      if (data.length === 0) {
        toast({
          title: "Sem registros",
          description: "Não foram encontrados registros para os filtros atuais.",
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Não foi possível buscar os registros.";
      safeLogger.error("Erro na busca de registros:", error);
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  }, [
    isActiveFilter,
    searchStatuses,
    selectedDates,
    selectedEmployee,
    toast,
  ]);

  const clearFilters = useCallback(() => {
    setSelectedDates([]);
    setSearchStatuses(["CREATED"]);
    setIsActiveFilter(true);
    setRecords([]);
    setSelectedRecordId(null);
    setNewStatus("");
    setHasSearched(false);
  }, []);

  const requestSaveStatus = useCallback(() => {
    if (!selectedRecord) {
      toast({
        title: "Selecione um registro",
        description: "Escolha um registro antes de salvar o status.",
        variant: "destructive",
      });
      return;
    }
    if (!newStatus || !ALL_TARGETS.includes(newStatus)) {
      toast({
        title: "Escolha o novo status",
        description: "Selecione Falta, Folga ou Abono para salvar a alteração.",
        variant: "destructive",
      });
      return;
    }
    if (!selectedRecord.timeRecordId || !selectedRecord.employeeId) {
      toast({
        title: "Registro inválido",
        description: "Identificadores ausentes. Faça a busca novamente.",
        variant: "destructive",
      });
      return;
    }
    setPendingDecision("save");
  }, [newStatus, selectedRecord, toast]);

  const requestToggleActivate = useCallback(() => {
    if (!selectedRecord) {
      toast({
        title: "Selecione um registro",
        description: "Escolha um registro antes de ativar ou inativar.",
        variant: "destructive",
      });
      return;
    }
    if (!selectedRecord.timeRecordId || !selectedRecord.employeeId) {
      toast({
        title: "Registro inválido",
        description: "Identificadores ausentes. Faça a busca novamente.",
        variant: "destructive",
      });
      return;
    }
    setPendingDecision("toggle");
  }, [selectedRecord, toast]);

  const cancelDecision = useCallback(() => {
    if (isSavingStatus || isTogglingActivate) return;
    setPendingDecision(null);
  }, [isSavingStatus, isTogglingActivate]);

  const confirmDecision = useCallback(async () => {
    if (!selectedRecord || !pendingDecision) return;
    const employeeId = selectedRecord.employeeId;
    const timeRecordId = String(selectedRecord.timeRecordId ?? "");

    if (!employeeId || !timeRecordId) {
      toast({
        title: "Registro inválido",
        description: "Identificadores ausentes. Faça a busca novamente.",
        variant: "destructive",
      });
      setPendingDecision(null);
      return;
    }

    if (pendingDecision === "save") {
      if (!newStatus) {
        setPendingDecision(null);
        return;
      }
      setIsSavingStatus(true);
      try {
        await updateRecordStatus(employeeId, timeRecordId, { statusRecord: newStatus });
        toast({
          title: "Status atualizado",
          description: "O registro foi atualizado com sucesso.",
        });
        setPendingDecision(null);
        await search();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Não foi possível atualizar o status.";
        safeLogger.error("Erro ao atualizar status:", error);
        toast({ title: "Erro", description: message, variant: "destructive" });
      } finally {
        setIsSavingStatus(false);
      }
      return;
    }

    setIsTogglingActivate(true);
    try {
      await toggleRecordActivate(employeeId, timeRecordId);
      toast({
        title: selectedRecord.active ? "Registro inativado" : "Registro ativado",
        description: selectedRecord.active
          ? "O registro deixou de aparecer como ativo."
          : "O registro voltou a ser considerado ativo.",
      });
      setPendingDecision(null);
      await search();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível alterar o estado do registro.";
      safeLogger.error("Erro ao alternar ativação:", error);
      toast({ title: "Erro", description: message, variant: "destructive" });
    } finally {
      setIsTogglingActivate(false);
    }
  }, [newStatus, pendingDecision, search, selectedRecord, toast]);

  return {
    isPartner,
    employees,
    selectedEmployee,
    setSelectedEmployee,
    employeeActive,
    setEmployeeActive,
    selectedDates,
    setSelectedDates,
    searchStatuses,
    toggleSearchStatus,
    setSearchStatuses,
    isActiveFilter,
    setIsActiveFilter,
    records,
    selectedRecord,
    selectRecord,
    newStatus,
    setNewStatus,
    isLoadingEmployees,
    isSearching,
    isSavingStatus,
    isTogglingActivate,
    hasSearched,
    search,
    clearFilters,
    requestSaveStatus,
    requestToggleActivate,
    cancelDecision,
    confirmDecision,
    pendingDecision,
  };
};
