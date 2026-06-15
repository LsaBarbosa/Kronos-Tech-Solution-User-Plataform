import {
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  isValid,
  isWeekend,
  parse,
  startOfDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type { VacationRequestResponse } from "@/types/vacation";
import type { VacationApprovalViewModel, VacationStatusTone } from "../types";

const CANDIDATE_FORMATS = ["yyyy-MM-dd", "dd-MM-yyyy", "dd/MM/yyyy", "yyyy/MM/dd"] as const;

const PENDING_TONE: VacationStatusTone = {
  badgeClass: "border border-[#FCD34D] bg-[#FEF3C7] text-[#92400E]",
  dotClass: "bg-[#F59E0B]",
};

const APPROVED_TONE: VacationStatusTone = {
  badgeClass: "border border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D]",
  dotClass: "bg-[#16A34A]",
};

const REJECTED_TONE: VacationStatusTone = {
  badgeClass: "border border-[#FECACA] bg-[#FEE2E2] text-[#B91C1C]",
  dotClass: "bg-[#DC2626]",
};

const NEUTRAL_TONE: VacationStatusTone = {
  badgeClass: "border border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]",
  dotClass: "bg-[#94A3B8]",
};

const PENDING_STATUSES = ["REQUEST_VACATION", "PENDING", "PENDING_APPROVAL"];
const APPROVED_STATUSES = ["VACATION", "APPROVED"];
const REJECTED_STATUSES = ["VACATION_REJECTED", "REJECTED"];

const normalizeStatus = (raw: string): string => (raw || "").trim().toUpperCase();

export const isPendingVacation = (raw: string | undefined | null): boolean =>
  raw ? PENDING_STATUSES.includes(normalizeStatus(raw)) : false;
export const isApprovedVacation = (raw: string | undefined | null): boolean =>
  raw ? APPROVED_STATUSES.includes(normalizeStatus(raw)) : false;
export const isRejectedVacation = (raw: string | undefined | null): boolean =>
  raw ? REJECTED_STATUSES.includes(normalizeStatus(raw)) : false;

export const getVacationStatusTone = (raw: string | undefined | null): VacationStatusTone => {
  if (isPendingVacation(raw)) return PENDING_TONE;
  if (isApprovedVacation(raw)) return APPROVED_TONE;
  if (isRejectedVacation(raw)) return REJECTED_TONE;
  return NEUTRAL_TONE;
};

export const getVacationStatusLabel = (raw: string | undefined | null): string => {
  if (isPendingVacation(raw)) return "Aguardando aprovação";
  if (isApprovedVacation(raw)) return "Aprovada";
  if (isRejectedVacation(raw)) return "Rejeitada";
  return raw ?? "—";
};

export const parseVacationDate = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  for (const pattern of CANDIDATE_FORMATS) {
    const parsed = parse(value, pattern, new Date());
    if (isValid(parsed)) return startOfDay(parsed);
  }
  const fallback = new Date(value);
  return isValid(fallback) ? startOfDay(fallback) : null;
};

export const formatVacationDate = (value: string | null | undefined): string => {
  const date = parseVacationDate(value);
  if (!date) return value ?? "—";
  return format(date, "dd/MM/yyyy", { locale: ptBR });
};

export const formatVacationDateLong = (value: string | null | undefined): string => {
  const date = parseVacationDate(value);
  if (!date) return value ?? "—";
  return format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
};

export const formatVacationPeriod = (start: string, end: string): string => {
  return `${formatVacationDate(start)} → ${formatVacationDate(end)}`;
};

export const computeVacationSpan = (start: string, end: string) => {
  const startDate = parseVacationDate(start);
  const endDate = parseVacationDate(end);
  if (!startDate || !endDate) {
    return { totalDays: 0, weekendDays: 0 };
  }
  const a = startDate <= endDate ? startDate : endDate;
  const b = endDate >= startDate ? endDate : startDate;
  const totalDays = differenceInCalendarDays(b, a) + 1;
  let weekendDays = 0;
  for (const day of eachDayOfInterval({ start: a, end: b })) {
    if (isWeekend(day)) weekendDays++;
  }
  return { totalDays, weekendDays };
};

export const getInitials = (name: string | undefined | null): string => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
};

export const buildVacationViewModel = (
  request: VacationRequestResponse
): VacationApprovalViewModel => {
  const raw = request.status;
  const isPending = isPendingVacation(raw);
  const isApproved = isApprovedVacation(raw);
  const isRejected = isRejectedVacation(raw);
  const { totalDays, weekendDays } = computeVacationSpan(request.startDate, request.endDate);

  return {
    raw: request,
    key: `${request.employeeId}:${request.startDate}:${request.endDate}:${request.timeRecordIdsForApproval.join(",")}`,
    employeeName: request.employeeName ?? "—",
    employeeId: request.employeeId,
    startDateLabel: formatVacationDate(request.startDate),
    endDateLabel: formatVacationDate(request.endDate),
    periodLabel: formatVacationPeriod(request.startDate, request.endDate),
    totalDays,
    weekendDays,
    recordIds: request.timeRecordIdsForApproval,
    recordsCount: request.timeRecordIdsForApproval.length,
    isPending,
    isApproved,
    isRejected,
    statusKind: isPending
      ? "pending"
      : isApproved
        ? "approved"
        : isRejected
          ? "rejected"
          : "other",
    statusLabel: getVacationStatusLabel(raw),
    statusTone: getVacationStatusTone(raw),
  };
};
