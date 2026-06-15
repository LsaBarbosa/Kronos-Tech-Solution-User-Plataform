import { differenceInCalendarDays, eachDayOfInterval, format, isValid, isWeekend, parse, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { VacationApprovalMetric, VacationApprovalUiStatus, VacationApprovalViewModel } from "../types";
import type { VacationRequestResponse } from "@/types/vacation";

const CANDIDATE_FORMATS = ["yyyy-MM-dd", "dd-MM-yyyy", "dd/MM/yyyy", "yyyy/MM/dd"] as const;

export const VACATION_APPROVAL_STATUS_LABELS: Record<VacationApprovalUiStatus, string> = {
  pending: "Aguardando aprovação",
  approved: "Aprovada",
  rejected: "Rejeitada",
  unknown: "Status desconhecido",
};

export const VACATION_APPROVAL_STATUS_STYLES: Record<VacationApprovalUiStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
  unknown: "border-slate-200 bg-slate-50 text-slate-600",
};

export const VACATION_APPROVAL_STATUS_ACCENTS: Record<VacationApprovalUiStatus, string> = {
  pending: "bg-amber-500",
  approved: "bg-emerald-500",
  rejected: "bg-rose-500",
  unknown: "bg-slate-400",
};

export const getVacationApprovalStatus = (rawStatus: string): VacationApprovalUiStatus => {
  const normalized = rawStatus.trim().toUpperCase();

  if (["REQUEST_VACATION", "PENDING", "PENDING_APPROVAL"].includes(normalized)) {
    return "pending";
  }

  if (["VACATION", "APPROVED"].includes(normalized)) {
    return "approved";
  }

  if (["VACATION_REJECTED", "REJECTED"].includes(normalized)) {
    return "rejected";
  }

  return "unknown";
};

export const getVacationApprovalStatusLabel = (rawStatus: string) =>
  VACATION_APPROVAL_STATUS_LABELS[getVacationApprovalStatus(rawStatus)];

export const getVacationApprovalStatusTone = (rawStatus: string) =>
  VACATION_APPROVAL_STATUS_STYLES[getVacationApprovalStatus(rawStatus)];

export const getVacationApprovalStatusAccent = (rawStatus: string) =>
  VACATION_APPROVAL_STATUS_ACCENTS[getVacationApprovalStatus(rawStatus)];

export const parseVacationDate = (value: string): Date | null => {
  for (const pattern of CANDIDATE_FORMATS) {
    const parsed = parse(value, pattern, new Date());
    if (isValid(parsed)) {
      return startOfDay(parsed);
    }
  }

  const fallback = new Date(value);
  return isValid(fallback) ? startOfDay(fallback) : null;
};

export const formatVacationDateLabel = (value: string): string => {
  const parsed = parseVacationDate(value);
  if (!parsed) {
    return value;
  }

  return format(parsed, "dd/MM/yyyy", { locale: ptBR });
};

export const formatVacationPeriodLabel = (startDate: string, endDate: string): string => {
  const formattedStart = formatVacationDateLabel(startDate);
  const formattedEnd = formatVacationDateLabel(endDate);
  return `${formattedStart} → ${formattedEnd}`;
};

export const getInitials = (name: string): string => {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return letters || "KR";
};

export const calculateVacationSpan = (startDate: string, endDate: string) => {
  const start = parseVacationDate(startDate);
  const end = parseVacationDate(endDate);

  if (!start || !end) {
    return {
      calendarDays: 0,
      businessDays: 0,
      weekendDays: 0,
      periodStart: start,
      periodEnd: end,
    };
  }

  const safeStart = start <= end ? start : end;
  const safeEnd = end >= start ? end : start;
  const calendarDays = differenceInCalendarDays(safeEnd, safeStart) + 1;
  const intervalDays = eachDayOfInterval({ start: safeStart, end: safeEnd });
  const weekendDays = intervalDays.filter((day) => isWeekend(day)).length;
  const businessDays = Math.max(intervalDays.length - weekendDays, 0);

  return {
    calendarDays,
    businessDays,
    weekendDays,
    periodStart: safeStart,
    periodEnd: safeEnd,
  };
};

export const buildVacationApprovalRequestKey = (request: VacationRequestResponse): string =>
  [request.employeeId, request.startDate, request.endDate, request.timeRecordIdsForApproval.join(",")].join(":");

export const mapVacationRequestToViewModel = (request: VacationRequestResponse): VacationApprovalViewModel => {
  const status = getVacationApprovalStatus(request.status);
  const span = calculateVacationSpan(request.startDate, request.endDate);
  const periodLabel =
    span.periodStart && span.periodEnd
      ? `${format(span.periodStart, "dd/MM/yyyy", { locale: ptBR })} → ${format(span.periodEnd, "dd/MM/yyyy", { locale: ptBR })}`
      : formatVacationPeriodLabel(request.startDate, request.endDate);
  const employeeInitials = getInitials(request.employeeName);

  return {
    key: buildVacationApprovalRequestKey(request),
    raw: request,
    employeeName: request.employeeName,
    employeeInitials,
    startDateLabel: formatVacationDateLabel(request.startDate),
    endDateLabel: formatVacationDateLabel(request.endDate),
    periodLabel,
    status,
    statusLabel: VACATION_APPROVAL_STATUS_LABELS[status],
    rawStatus: request.status,
    canDecide: status === "pending",
    calendarDays: span.calendarDays,
    businessDays: span.businessDays,
    weekendDays: span.weekendDays,
    recordsCount: request.timeRecordIdsForApproval.length,
  };
};

export const buildVacationMetric = (
  label: string,
  value: number,
  tone: VacationApprovalMetric["tone"],
  description: string
): VacationApprovalMetric => ({
  label,
  value,
  tone,
  description,
});
