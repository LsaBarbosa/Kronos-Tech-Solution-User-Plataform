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
import { loadPdfLibraries, downloadCsvFile } from "@/utils/report-export";
import { formatDateWithDayOfWeek, getTranslatedStatus, isHoliday } from "@/utils/report-utils";

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
      console.error("Erro ao carregar aprovadores:", error);
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
      console.error("Erro ao carregar colaboradores:", error);
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

  const handleDownloadPDF = useCallback(async () => {
    if (!reportData.length) {
      toast({ title: "Erro", description: "Não há dados para gerar o PDF.", variant: "destructive" });
      return;
    }

    const { jsPDF, autoTable } = await loadPdfLibraries();
    const doc = new jsPDF();

    const PRIMARY_COLOR: [number, number, number] = [16, 42, 67];
    const ACCENT_COLOR: [number, number, number] = [31, 78, 95];
    const TEXT_COLOR: [number, number, number] = [51, 65, 85];
    const LABEL_COLOR: [number, number, number] = [98, 125, 152];
    const BG_LIGHT: [number, number, number] = [245, 248, 251];

    const getStatusRGB = (status: string): [number, number, number] => {
      switch (status) {
        case "CREATED":
          return [22, 163, 74];
        case "UPDATED":
          return [37, 99, 235];
        case "PENDING":
          return [234, 179, 8];
        case "ABSENCE":
          return [220, 38, 38];
        case "DAY_OFF":
          return [100, 116, 139];
        case "TIME_OFF":
          return [147, 51, 234];
        case "VACATION":
          return [13, 148, 136];
        case "IMPLICIT_BREAK":
          return [156, 163, 175];
        case "PENDING_APPROVAL":
          return [249, 115, 22];
        default:
          return [71, 85, 105];
      }
    };

    const timeToMinutes = (value: string) => {
      if (!value || value === "--:--") {
        return 0;
      }

      const sign = value.startsWith("-") ? -1 : 1;
      const parts = value.replace("-", "").split(":");
      if (parts.length !== 2) {
        return 0;
      }

      const [hours, minutes] = parts.map(Number);
      return sign * ((hours * 60) + minutes);
    };

    const minutesToTime = (totalMinutes: number) => {
      const sign = totalMinutes < 0 ? "-" : "";
      const absMinutes = Math.abs(totalMinutes);
      const hours = Math.floor(absMinutes / 60);
      const minutes = absMinutes % 60;
      return `${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    };

    const parseReportDate = (value: string) => {
      const [day, month, year] = value.split("-").map(Number);
      if (!day || !month || !year) {
        return null;
      }

      const date = new Date(year, month - 1, day);
      return Number.isNaN(date.getTime()) ? null : date;
    };

    let totalMinutesWorked = 0;
    let totalMinutesBalance = 0;

    reportData.forEach((item) => {
      if (item.statusRecord !== "IMPLICIT_BREAK" && item.statusRecord !== "PENDING") {
        totalMinutesWorked += timeToMinutes(item.hoursWork);
        totalMinutesBalance += timeToMinutes(item.balance);
      }
    });

    const fileName = `relatorio_detalhado_${format(new Date(), "yyyyMMdd_HHmmss")}.pdf`;
    const employeeName = reportData[0]?.employeeData?.employeeName || "N/A";
    const companyName = reportData[0]?.employeeData?.companyName || "N/A";
    const periodStart = selectedDates[0] ? format(selectedDates[0], "dd/MM/yyyy") : "-";
    const periodEnd = selectedDates[selectedDates.length - 1] ? format(selectedDates[selectedDates.length - 1], "dd/MM/yyyy") : "-";

    doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
    doc.rect(14, 15, 2, 12, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
    doc.text("Relatório de Ponto", 20, 24);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(LABEL_COLOR[0], LABEL_COLOR[1], LABEL_COLOR[2]);
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 196, 24, { align: "right" });

    const boxY = 32;
    const boxHeight = 35;
    doc.setFillColor(BG_LIGHT[0], BG_LIGHT[1], BG_LIGHT[2]);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, boxY, 182, boxHeight, 2, 2, "FD");

    const col1X = 20;
    doc.setFontSize(8);
    doc.setTextColor(LABEL_COLOR[0], LABEL_COLOR[1], LABEL_COLOR[2]);
    doc.text("EMPRESA", col1X, boxY + 8);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
    doc.text(companyName.toUpperCase(), col1X, boxY + 13);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(LABEL_COLOR[0], LABEL_COLOR[1], LABEL_COLOR[2]);
    doc.text("COLABORADOR", col1X, boxY + 23);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
    doc.text(employeeName.toUpperCase(), col1X, boxY + 28);

    const col2X = 110;
    const col3X = 155;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(LABEL_COLOR[0], LABEL_COLOR[1], LABEL_COLOR[2]);
    doc.text("PERÍODO SELECIONADO", col2X, boxY + 8);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
    doc.text(`${periodStart} a ${periodEnd}`, col2X, boxY + 13);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(LABEL_COLOR[0], LABEL_COLOR[1], LABEL_COLOR[2]);
    doc.text("TOTAL TRABALHADO", col2X, boxY + 23);
    doc.text("SALDO DO PERÍODO", col3X, boxY + 23);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
    doc.text(minutesToTime(totalMinutesWorked), col2X, boxY + 29);

    doc.setTextColor(totalMinutesBalance < 0 ? 220 : 22, totalMinutesBalance < 0 ? 38 : 163, totalMinutesBalance < 0 ? 38 : 74);
    doc.text(minutesToTime(totalMinutesBalance), col3X, boxY + 29);

    const tableBody = reportData.map((item) => {
      const isBreak = item.statusRecord === "IMPLICIT_BREAK";
      const isPending = item.statusRecord === "PENDING";
      const formattedDateStart = formatDateWithDayOfWeek(item.startWork);
      const formattedDateEnd = isPending ? "-" : formatDateWithDayOfWeek(item.endWork);
      const displayEndHour = isPending ? "--:--" : item.endHour;
      const displayDuration = isPending ? "--:--" : item.hoursWork;
      const displayBalance = isBreak || isPending ? "00:00" : item.balance;
      const colInicio = `${formattedDateStart}\n${item.startHour}`;
      const colFim = isPending ? "Em andamento" : `${formattedDateEnd}\n${displayEndHour}`;
      const statusRGB = getStatusRGB(item.statusRecord);
      const parsedDate = parseReportDate(item.startWork);
      const isItemHoliday = parsedDate ? isHoliday(parsedDate) : false;
      const statusLabel = getTranslatedStatus(item.statusRecord);

      return [
        { content: colInicio, styles: { halign: "center" } },
        { content: colFim, styles: { halign: "center" } },
        { content: displayDuration, styles: { halign: "center" } },
        { content: displayBalance, styles: { halign: "center" } },
        {
          content: isItemHoliday ? `${statusLabel} (FERIADO)` : statusLabel,
          styles: {
            fontStyle: "bold",
            textColor: [255, 255, 255],
            fillColor: statusRGB,
            halign: "center",
            cellPadding: 3,
          },
        },
      ];
    });

    autoTable(doc, {
      startY: boxY + boxHeight + 10,
      head: [["Início da Jornada", "Fim da Jornada", "Duração", "Saldo", "Status"]],
      body: tableBody,
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 4,
        valign: "middle",
        lineWidth: 0,
        lineColor: [226, 232, 240],
      },
      headStyles: {
        fillColor: ACCENT_COLOR,
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
        cellPadding: 5,
        lineWidth: 0,
      },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 45 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: "auto", fontStyle: "bold" },
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
    });

    doc.save(fileName);
  }, [reportData, selectedDates, toast]);

  const handleDownloadCSV = useCallback(async () => {
    if (!reportData.length) {
      toast({ title: "Erro", description: "Não há dados para gerar o CSV.", variant: "destructive" });
      return;
    }

    const headers = ["Data Início", "Hora Início", "Data Fim", "Hora Fim", "Duração", "Saldo", "Status", "Funcionário", "Empresa"];
    const rows = reportData.map((item) => {
      const isPending = item.statusRecord === "PENDING";
      return [
        item.startWork,
        item.startHour,
        isPending ? "" : item.endWork,
        isPending ? "" : item.endHour,
        isPending ? "" : item.hoursWork,
        item.statusRecord === "IMPLICIT_BREAK" || isPending ? "00:00" : item.balance,
        getTranslatedStatus(item.statusRecord),
        item.employeeData.employeeName,
        item.employeeData.companyName,
      ];
    });

    const fileName = `relatorio_detalhado_csv_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`;
    downloadCsvFile(rows, headers, fileName);
    toast({ title: "CSV Gerado", description: "Relatório detalhado baixado em formato CSV!" });
  }, [reportData, toast]);

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
        console.error("Erro ao salvar:", error);
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
