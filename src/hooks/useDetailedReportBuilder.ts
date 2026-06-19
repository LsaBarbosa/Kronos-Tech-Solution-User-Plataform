import { useCallback, useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { format } from "date-fns";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { preloadCsrfToken } from "@/service/csrf.service";
import {
  fetchDetailedReport,
  fetchManagerOptions,
  fetchReportEmployees,
  updateTimeRecord,
} from "@/service/records.service";
import type { DetailedReportItem, Employee, EditRecordFormData, Manager } from "@/utils/report-utils";
import { editRecordSchema } from "@/utils/report-utils";
import { getRoleMeta, isValidReferenceTime, summarizeDetailedReport, formatSelectedDatesLabel, buildSelectionSummary, type ReportRoleMeta, type ReportSearchState, type ReportSummary } from "@/components/relatorio-detalhado/report-ui.helpers";
import {
  downloadDetailedReportPdf,
  downloadDetailedReportCsv,
  type ReportExportPayload,
} from "@/features/detailed-report-export";
import { safeLogger } from "@/utils/security/safeLogger";

export type EmployeeScope = "active" | "inactive";

export type DetailedReportBuilderViewModel = {
  role: "CTO" | "MANAGER" | "PARTNER";
  roleMeta: ReportRoleMeta;
  selectedDates: Date[];
  setSelectedDates: Dispatch<SetStateAction<Date[]>>;
  selectedDatesLabel: string;
  referenceTime: string;
  setReferenceTime: Dispatch<SetStateAction<string>>;
  reportActive: boolean;
  setReportActive: Dispatch<SetStateAction<boolean>>;
  selectedStatuses: string[];
  toggleStatus: (status: string) => void;
  clearStatuses: () => void;
  employeeScope: EmployeeScope;
  setEmployeeScope: Dispatch<SetStateAction<EmployeeScope>>;
  employees: Employee[];
  selectedEmployee: string;
  setSelectedEmployee: Dispatch<SetStateAction<string>>;
  selectedEmployeeLabel: string;
  isPartner: boolean;
  isLoadingEmployees: boolean;
  searchState: ReportSearchState;
  searchError: string | null;
  reportData: DetailedReportItem[];
  reportSummary?: ReportSummary;
  isLoadingReport: boolean;
  hasResults: boolean;
  canGenerate: boolean;
  selectionSummary: string;
  resultsAnchorId: string;
  scrollToResults: () => void;
  handleGenerate: () => Promise<void>;
  handleClear: () => void;
  handleDownloadPDF: () => Promise<void>;
  handleDownloadCSV: () => Promise<void>;
  handleEditRecord: (record: DetailedReportItem) => void;
  editModalOpen: boolean;
  setEditModalOpen: Dispatch<SetStateAction<boolean>>;
  selectedRecord: DetailedReportItem | null;
  managers: Manager[];
  form: UseFormReturn<EditRecordFormData>;
  handleSaveRecord: (data: EditRecordFormData) => Promise<void>;
  isSavingRecord: boolean;
};

const RESULTS_ANCHOR_ID = "detailed-report-results";

export const useDetailedReportBuilder = (): DetailedReportBuilderViewModel => {
  const { toast } = useToast();
  const { status: authStatus, role, user } = useAuth();

  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [referenceTime, setReferenceTime] = useState("08:00");
  const [reportActive, setReportActive] = useState(true);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [employeeScope, setEmployeeScope] = useState<EmployeeScope>("active");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [searchState, setSearchState] = useState<ReportSearchState>("idle");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<DetailedReportItem[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DetailedReportItem | null>(null);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [isSavingRecord, setIsSavingRecord] = useState(false);
  const form = useForm<EditRecordFormData>({
    resolver: zodResolver(editRecordSchema),
    defaultValues: {
      startDate: "",
      endDate: "",
      startHour: "",
      endHour: "",
      managerId: "",
    },
  });

  const roleMeta = getRoleMeta(role);
  const normalizedRole = role === "CTO" || role === "MANAGER" || role === "PARTNER" ? role : "PARTNER";
  const isPartner = normalizedRole === "PARTNER";

  const selfEmployeeId = user?.profile?.employeeId || user?.account.employeeId || "";
  const selfEmployeeLabel = user?.profile?.fullName || user?.account.username || "Meu colaborador";

  const selectedEmployeeLabel = useMemo(() => {
    if (isPartner) {
      return selfEmployeeLabel;
    }

    return employees.find((employee) => employee.employeeId === selectedEmployee)?.fullName || "Selecione um colaborador";
  }, [employees, isPartner, selectedEmployee, selfEmployeeLabel]);

  const selectedDatesLabel = useMemo(() => formatSelectedDatesLabel(selectedDates), [selectedDates]);
  const reportSummary = useMemo(
    () => (reportData.length > 0 ? summarizeDetailedReport(reportData, selectedDates) : undefined),
    [reportData, selectedDates]
  );

  const selectionSummary = useMemo(
    () =>
      buildSelectionSummary({
        dates: selectedDates,
        reference: referenceTime,
        employeeLabel: selectedEmployeeLabel,
        statusCount: selectedStatuses.length,
      }),
    [referenceTime, selectedDates, selectedEmployeeLabel, selectedStatuses.length]
  );

  const hasResults = reportData.length > 0;
  const canGenerate =
    selectedDates.length > 0 &&
    isValidReferenceTime(referenceTime) &&
    (isPartner ? Boolean(selfEmployeeId) : Boolean(selectedEmployee)) &&
    !isLoadingReport;

  const setStatus = useCallback((status: string) => {
    setSelectedStatuses((previous) =>
      previous.includes(status)
        ? previous.filter((current) => current !== status)
        : [...previous, status]
    );
  }, []);

  const clearStatuses = useCallback(() => {
    setSelectedStatuses([]);
  }, []);

  const loadManagers = useCallback(async () => {
    try {
      const options = await fetchManagerOptions();
      setManagers(
        options.map((manager) => ({
          id: manager.userId,
          name: manager.fullName ?? manager.username,
        }))
      );
    } catch (error) {
      safeLogger.error("Erro ao carregar aprovadores:", error);
      const message = error instanceof Error ? error.message : "Não foi possível carregar os aprovadores.";
      toast({ title: "Erro", description: message, variant: "destructive" });
    }
  }, [toast]);

  const loadEmployees = useCallback(async () => {
    if (authStatus !== "authenticated") {
      return;
    }

    if (isPartner) {
      setEmployees(
        selfEmployeeId
          ? [{ employeeId: selfEmployeeId, fullName: selfEmployeeLabel }]
          : []
      );
      setSelectedEmployee(selfEmployeeId);
      return;
    }

    setIsLoadingEmployees(true);

    try {
      const list = await fetchReportEmployees(employeeScope === "active");
      setEmployees(list);
    } catch (error) {
      safeLogger.error("Erro ao carregar colaboradores:", error);
      const message = error instanceof Error ? error.message : "Não foi possível carregar os colaboradores.";
      toast({ title: "Erro", description: message, variant: "destructive" });
    } finally {
      setIsLoadingEmployees(false);
    }
  }, [authStatus, employeeScope, isPartner, selfEmployeeId, selfEmployeeLabel, toast]);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      return;
    }

    void loadManagers();
  }, [authStatus, loadManagers]);

  useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);

  useEffect(() => {
    if (isPartner) {
      return;
    }

    if (selectedEmployee && employees.length > 0 && !employees.some((employee) => employee.employeeId === selectedEmployee)) {
      setSelectedEmployee("");
    }
  }, [employees, isPartner, selectedEmployee]);

  const scrollToResults = useCallback(() => {
    const element = document.getElementById(RESULTS_ANCHOR_ID);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const executeSearch = useCallback(
    async (options?: { quiet?: boolean }) => {
      if (!isValidReferenceTime(referenceTime)) {
        toast({
          title: "Validação",
          description: "Informe a carga horária diária no formato HH:mm. Exemplo: 08:00.",
          variant: "destructive",
        });
        return;
      }

      if (selectedDates.length === 0) {
        toast({
          title: "Validação",
          description: "Selecione ao menos uma data para gerar o relatório.",
          variant: "destructive",
        });
        return;
      }

      if (!isPartner && !selectedEmployee) {
        toast({
          title: "Validação",
          description: "Selecione um colaborador para gerar o relatório.",
          variant: "destructive",
        });
        return;
      }

      setIsLoadingReport(true);
      setSearchError(null);
      setSearchState("loading");
      setReportData([]);

      try {
        await preloadCsrfToken();

        const response = await fetchDetailedReport({
          reference: referenceTime,
          active: reportActive,
          dates: selectedDates.map((date) => format(date, "dd-MM-yyyy")),
          ...(selectedStatuses.length > 0 ? { statuses: selectedStatuses } : {}),
          employeeId: isPartner ? selfEmployeeId || undefined : selectedEmployee || undefined,
        });

        if (response.length === 0) {
          setSearchState("empty");
          if (!options?.quiet) {
            toast({
              title: "Aviso",
              description: "Não há registros para os filtros selecionados.",
            });
          }
          return;
        }

        setReportData(response);
        setSearchState("success");

        if (!options?.quiet) {
          toast({ title: "Busca realizada", description: "Relatório gerado com sucesso." });
        }

        window.requestAnimationFrame(() => {
          scrollToResults();
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Ocorreu um erro ao buscar o relatório.";
        setSearchError(message);
        setSearchState("error");
        toast({ title: "Erro", description: message, variant: "destructive" });
      } finally {
        setIsLoadingReport(false);
      }
    },
    [
      isPartner,
      referenceTime,
      reportActive,
      scrollToResults,
      selectedDates,
      selectedEmployee,
      selectedStatuses,
      selfEmployeeId,
      toast,
    ]
  );

  const handleGenerate = useCallback(async () => {
    await executeSearch();
  }, [executeSearch]);

  const buildExportPayload = useCallback((): ReportExportPayload | null => {
    if (!reportData.length) return null;

    const isSelfReport = isPartner;
    const profile = user?.profile;

    return {
      records: reportData,
      identity: {
        companyName: reportData[0]?.employeeData?.companyName || profile?.companyName || "",
        companyCnpj: null,
        employeeName: reportData[0]?.employeeData?.employeeName || profile?.fullName || "",
        employeeMaskedCpf: profile?.maskedCpf ?? null,
        employeeJobPosition: profile?.jobPosition ?? null,
        referenceTime,
        employeeId: reportData[0]?.employeeId ?? null,
        isSelfReport,
      },
      context: {
        selectedDates,
        selectedStatuses,
        reportActive,
        role: normalizedRole,
        generatedByUsername: user?.account?.username ?? null,
        generatedAt: new Date(),
      },
    };
  }, [
    isPartner,
    normalizedRole,
    referenceTime,
    reportActive,
    reportData,
    selectedDates,
    selectedStatuses,
    user,
  ]);

  const handleDownloadPDF = useCallback(async () => {
    const payload = buildExportPayload();
    if (!payload) {
      toast({ title: "Erro", description: "Não há dados para gerar o PDF.", variant: "destructive" });
      return;
    }
    try {
      await downloadDetailedReportPdf(payload);
      toast({ title: "PDF gerado", description: "Relatório detalhado baixado em PDF." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao gerar o PDF.";
      safeLogger.error("Erro ao gerar PDF:", error);
      toast({ title: "Erro", description: message, variant: "destructive" });
    }
  }, [buildExportPayload, toast]);

  const handleDownloadCSV = useCallback(async () => {
    const payload = buildExportPayload();
    if (!payload) {
      toast({ title: "Erro", description: "Não há dados para gerar o CSV.", variant: "destructive" });
      return;
    }
    try {
      downloadDetailedReportCsv(payload);
      toast({ title: "CSV gerado", description: "Relatório detalhado baixado em CSV." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao gerar o CSV.";
      safeLogger.error("Erro ao gerar CSV:", error);
      toast({ title: "Erro", description: message, variant: "destructive" });
    }
  }, [buildExportPayload, toast]);

  const handleEditRecord = useCallback(
    (record: DetailedReportItem) => {
      setSelectedRecord(record);

      const formatDateToInput = (dateString: string) => {
        if (!dateString) {
          return "";
        }

        const parts = dateString.split("-");
        return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : dateString;
      };

      form.reset({
        startDate: formatDateToInput(record.startWork),
        endDate: formatDateToInput(record.endWork),
        managerId: managers[0]?.id || "",
        startHour: record.startHour,
        endHour: record.endHour,
      });
      setEditModalOpen(true);
    },
    [form, managers]
  );

  const executeReportAfterSave = useCallback(async () => {
    await executeSearch({ quiet: true });
  }, [executeSearch]);

  const handleSaveRecord = useCallback(
    async (data: EditRecordFormData) => {
      if (isSavingRecord) {
        return;
      }

      if (!selectedRecord?.timeRecordId) {
        toast({ title: "Erro", description: "Registro não encontrado.", variant: "destructive" });
        return;
      }

      setIsSavingRecord(true);

      try {
        await preloadCsrfToken();

        await updateTimeRecord(selectedRecord.timeRecordId, {
          startDate: data.startDate,
          endDate: data.endDate,
          startHour: data.startHour,
          endHour: data.endHour,
          managerId: data.managerId,
        });

        toast({ title: "Sucesso", description: "Registro atualizado e enviado para revisão." });
        setEditModalOpen(false);
        setSelectedRecord(null);
        form.reset();
        await executeReportAfterSave();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Ocorreu um erro ao salvar o ajuste.";
        safeLogger.error("Erro ao salvar:", error);
        toast({ title: "Erro", description: message, variant: "destructive" });
      } finally {
        setIsSavingRecord(false);
      }
    },
    [executeReportAfterSave, form, isSavingRecord, selectedRecord, toast]
  );

  const handleClear = useCallback(() => {
    setSelectedDates([]);
    setReferenceTime("08:00");
    setReportActive(true);
    setSelectedStatuses([]);
    setEmployeeScope("active");
    setSelectedEmployee(isPartner ? selfEmployeeId : "");
    setReportData([]);
    setSearchError(null);
    setSearchState("idle");
    setEditModalOpen(false);
    setSelectedRecord(null);
    form.reset();
  }, [form, isPartner, selfEmployeeId]);

  return {
    role: normalizedRole,
    roleMeta,
    selectedDates,
    setSelectedDates,
    selectedDatesLabel,
    referenceTime,
    setReferenceTime,
    reportActive,
    setReportActive,
    selectedStatuses,
    toggleStatus: setStatus,
    clearStatuses,
    employeeScope,
    setEmployeeScope,
    employees,
    selectedEmployee,
    setSelectedEmployee,
    selectedEmployeeLabel,
    isPartner,
    isLoadingEmployees,
    searchState,
    searchError,
    reportData,
    reportSummary,
    isLoadingReport,
    hasResults,
    canGenerate,
    selectionSummary,
    resultsAnchorId: RESULTS_ANCHOR_ID,
    scrollToResults,
    handleGenerate,
    handleClear,
    handleDownloadPDF,
    handleDownloadCSV,
    handleEditRecord,
    editModalOpen,
    setEditModalOpen,
    selectedRecord,
    managers,
    form,
    handleSaveRecord,
    isSavingRecord,
  };
};

export default useDetailedReportBuilder;
