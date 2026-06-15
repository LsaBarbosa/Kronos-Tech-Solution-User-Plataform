import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { AppRole } from "@/config/app-routes";
import type { DetailedReportItem } from "@/utils/report-utils";
import { statusMap } from "@/utils/report-utils";
import {
  formatMinutesToBalance,
  formatMinutesToTime,
  parseBalanceToMinutes,
  parseTimeToMinutes,
} from "@/components/ResultadosRelatorioDetalhado.utils";

export type ReportSearchState = "idle" | "loading" | "success" | "empty" | "error";

export type ReportRoleTone = "cto" | "manager" | "partner";

export type ReportRoleMeta = {
  role: AppRole;
  label: string;
  title: string;
  description: string;
  note: string;
  tone: ReportRoleTone;
  badgeClassName: string;
  chipClassName: string;
};

export type ReportSummary = {
  totalRecords: number;
  totalWorkedHours: string;
  totalBalance: string;
  mostRecurringStatus: string;
  periodLabel: string;
};

export const REPORT_ROLE_META: Record<AppRole, ReportRoleMeta> = {
  CTO: {
    role: "CTO",
    label: "CTO",
    title: "Escopo administrativo amplo",
    description: "Visão ampliada para auditoria e acompanhamento global.",
    note: "Sem troca de empresa nesta tela.",
    tone: "cto",
    badgeClassName: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1F4E5F]",
    chipClassName: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1F4E5F]",
  },
  MANAGER: {
    role: "MANAGER",
    label: "MANAGER",
    title: "Gestão operacional",
    description: "Colaboradores vinculados ao tenant/equipe atual.",
    note: "Seleção permitida dentro do contexto operacional.",
    tone: "manager",
    badgeClassName: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
    chipClassName: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
  },
  PARTNER: {
    role: "PARTNER",
    label: "PARTNER",
    title: "Consulta individual",
    description: "Relatório do próprio ponto, sem troca de colaborador.",
    note: "Colaborador bloqueado pela sessão autenticada.",
    tone: "partner",
    badgeClassName: "border-[#99F6E4] bg-[#CCFBF1] text-[#0F766E]",
    chipClassName: "border-[#99F6E4] bg-[#CCFBF1] text-[#0F766E]",
  },
};

export const reportStatusLabels = statusMap;

export const isValidReferenceTime = (value: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value.trim());

export const sortDates = (dates: Date[]) =>
  [...dates].sort((left, right) => left.getTime() - right.getTime());

export const formatReportChipDate = (date: Date) =>
  format(date, "dd MMM", { locale: ptBR }).replace(".", "").toUpperCase();

export const formatSelectedDatesLabel = (dates: Date[]) => {
  if (dates.length === 0) {
    return "Nenhuma data selecionada";
  }

  const sortedDates = sortDates(dates);
  const chips = sortedDates.slice(0, 3).map(formatReportChipDate);
  const extraCount = sortedDates.length - chips.length;

  return extraCount > 0 ? `${chips.join(", ")} +${extraCount}` : chips.join(", ");
};

export const formatPeriodLabel = (dates: Date[]) => {
  if (dates.length === 0) {
    return "Período não definido";
  }

  const sortedDates = sortDates(dates);
  const start = format(sortedDates[0], "dd/MM/yyyy");
  const end = format(sortedDates[sortedDates.length - 1], "dd/MM/yyyy");

  return start === end ? start : `${start} a ${end}`;
};

export const buildSelectionSummary = ({
  dates,
  reference,
  employeeLabel,
  statusCount,
}: {
  dates: Date[];
  reference: string;
  employeeLabel: string;
  statusCount: number;
}) => {
  const dateCountLabel = `${dates.length} ${dates.length === 1 ? "data" : "datas"}`;
  const statusLabel = `${statusCount} ${statusCount === 1 ? "status" : "status"}`;
  return `${dateCountLabel} · ${reference || "HH:mm"} · ${employeeLabel} · ${statusLabel}`;
};

export const summarizeDetailedReport = (reportData: DetailedReportItem[], selectedDates: Date[]): ReportSummary => {
  const uniqueDays = new Set<string>();
  const statusCounter = new Map<string, number>();
  let totalBalanceMinutes = 0;
  let totalWorkedMinutes = 0;

  reportData.forEach((record) => {
    const dayKey = record.startWork.includes(" ") ? record.startWork.split(" ")[0] : record.startWork;

    if (!uniqueDays.has(dayKey)) {
      uniqueDays.add(dayKey);
      if (record.balance) {
        totalBalanceMinutes += parseBalanceToMinutes(record.balance);
      }
    }

    if (record.statusRecord) {
      statusCounter.set(record.statusRecord, (statusCounter.get(record.statusRecord) ?? 0) + 1);
    }

    if (record.statusRecord !== "IMPLICIT_BREAK" && record.hoursWork) {
      totalWorkedMinutes += parseTimeToMinutes(record.hoursWork);
    }
  });

  const mostRecurringStatusEntry = [...statusCounter.entries()].sort((left, right) => right[1] - left[1])[0];
  const mostRecurringStatus = mostRecurringStatusEntry
    ? reportStatusLabels[mostRecurringStatusEntry[0]] ?? mostRecurringStatusEntry[0]
    : "Sem histórico";

  return {
    totalRecords: reportData.length,
    totalWorkedHours: formatMinutesToTime(totalWorkedMinutes),
    totalBalance: formatMinutesToBalance(totalBalanceMinutes),
    mostRecurringStatus,
    periodLabel: formatPeriodLabel(selectedDates),
  };
};

export const getRoleMeta = (role: string | undefined | null): ReportRoleMeta => {
  if (role === "CTO" || role === "MANAGER" || role === "PARTNER") {
    return REPORT_ROLE_META[role];
  }

  return REPORT_ROLE_META.PARTNER;
};
