import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { TimeRecordApprovalResponse } from "@/types/recordApproval";

const safeParseISO = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  try {
    const parsed = parseISO(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const formatDateTime = (value: string | null | undefined): string => {
  const date = safeParseISO(value);
  if (!date) return "—";
  return format(date, "dd/MM HH:mm", { locale: ptBR });
};

export const formatDateLong = (value: string | null | undefined): string => {
  const date = safeParseISO(value);
  if (!date) return "—";
  return format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
};

export const computeHoursDiff = (
  startISO: string | null | undefined,
  endISO: string | null | undefined
): string => {
  const start = safeParseISO(startISO);
  const end = safeParseISO(endISO);
  if (!start || !end) return "—";
  const diffMs = end.getTime() - start.getTime();
  if (diffMs <= 0) return "0h00";
  const totalMinutes = Math.round(diffMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h${String(minutes).padStart(2, "0")}`;
};

export const isPendingClosure = (record: TimeRecordApprovalResponse): boolean =>
  !record.currentEndWork;

export const getInitials = (name: string | undefined | null): string => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
};
