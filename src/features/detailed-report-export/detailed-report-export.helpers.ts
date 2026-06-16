import { format, parse, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  getTranslatedStatus,
  isHoliday,
  type DetailedReportItem,
} from "@/utils/report-utils";
import type {
  EventCategory,
  ReportTotals,
} from "./detailed-report-export.types";

/**
 * Converte "HH:mm" ou "-HH:mm" para minutos com sinal.
 * Retorna 0 para entradas vazias, "--:--" ou inválidas.
 */
export const parseSignedDurationToMinutes = (value: string | null | undefined): number => {
  if (!value) return 0;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "--:--" || trimmed === "00:00" || trimmed === "+00:00" || trimmed === "-00:00") {
    return 0;
  }
  const sign = trimmed.startsWith("-") ? -1 : 1;
  const cleaned = trimmed.replace(/^[+-]/, "");
  const parts = cleaned.split(":");
  if (parts.length !== 2) return 0;
  const [hours, minutes] = parts.map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;
  return sign * (hours * 60 + minutes);
};

/**
 * Versão estritamente não-negativa (descarta sinal). Útil para "duração trabalhada".
 */
export const parseUnsignedDurationToMinutes = (value: string | null | undefined): number =>
  Math.abs(parseSignedDurationToMinutes(value));

export const formatMinutesAsSignedHHMM = (totalMinutes: number): string => {
  if (totalMinutes === 0) return "00:00";
  const sign = totalMinutes < 0 ? "-" : "+";
  const abs = Math.abs(totalMinutes);
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  return `${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

export const formatMinutesAsHHMM = (totalMinutes: number): string => {
  const abs = Math.abs(totalMinutes);
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

/**
 * Status que NÃO compõem o total trabalhado: pausa implícita e pendência.
 */
export const STATUSES_EXCLUDED_FROM_WORKED_TOTAL = new Set([
  "IMPLICIT_BREAK",
  "PENDING",
]);

/**
 * Mapeia o status do registro para uma categoria contábil mais ampla.
 */
export const getEventCategory = (status: string | null | undefined): EventCategory => {
  switch (status) {
    case "CREATED":
    case "UPDATED":
    case "PENDING_APPROVAL":
    case "WORK_TIME_REQUEST":
    case "WORK_TIME_REJECTED":
    case "UPDATE_REJECTED":
      return "work";
    case "ABSENCE":
      return "absence";
    case "DAY_OFF":
      return "day_off";
    case "VACATION":
    case "REQUEST_VACATION":
    case "VACATION_REJECTED":
      return "vacation";
    case "TIME_OFF":
    case "TIME_OFF_REQUEST":
    case "TIME_OFF_REJECTED":
      return "time_off";
    case "PENDING":
      return "pending";
    case "IMPLICIT_BREAK":
      return "implicit_break";
    default:
      return "other";
  }
};

const INITIAL_COUNTS: Record<EventCategory, number> = {
  work: 0,
  absence: 0,
  day_off: 0,
  vacation: 0,
  time_off: 0,
  pending: 0,
  implicit_break: 0,
  other: 0,
};

/**
 * Verifica se há latitude/longitude (qualquer dos pares) coletados no registro.
 */
const hasGeolocation = (item: DetailedReportItem): boolean =>
  (item.latitude !== null && item.latitude !== undefined) ||
  (item.longitude !== null && item.longitude !== undefined) ||
  (item.endLatitude !== null && item.endLatitude !== undefined) ||
  (item.endLongitude !== null && item.endLongitude !== undefined);

const hasDocument = (item: DetailedReportItem): boolean =>
  Boolean(item.documentId || item.documentDownloadUrl || item.documentDownloadPath);

export const aggregateReportTotals = (records: DetailedReportItem[]): ReportTotals => {
  let totalWorkedMinutes = 0;
  let totalBalanceMinutes = 0;
  let positiveMinutes = 0;
  let negativeMinutes = 0;
  let pendingCount = 0;
  let geoCount = 0;
  let documentCount = 0;

  const countsByCategory: Record<EventCategory, number> = { ...INITIAL_COUNTS };

  for (const record of records) {
    const status = record.statusRecord;
    const category = getEventCategory(status);
    countsByCategory[category] += 1;

    if (status === "PENDING") {
      pendingCount += 1;
    }
    if (hasGeolocation(record)) {
      geoCount += 1;
    }
    if (hasDocument(record)) {
      documentCount += 1;
    }

    if (STATUSES_EXCLUDED_FROM_WORKED_TOTAL.has(status)) {
      continue;
    }

    totalWorkedMinutes += parseUnsignedDurationToMinutes(record.hoursWork);
    const balanceMinutes = parseSignedDurationToMinutes(record.balance);
    totalBalanceMinutes += balanceMinutes;
    if (balanceMinutes > 0) {
      positiveMinutes += balanceMinutes;
    } else if (balanceMinutes < 0) {
      negativeMinutes += Math.abs(balanceMinutes);
    }
  }

  return {
    totalWorkedMinutes,
    totalBalanceMinutes,
    positiveMinutes,
    negativeMinutes,
    countsByCategory,
    pendingCount,
    geoCount,
    documentCount,
    totalRecords: records.length,
  };
};

const sortDates = (dates: Date[]) =>
  [...dates].sort((left, right) => left.getTime() - right.getTime());

export const getPeriodBoundaries = (dates: Date[]) => {
  if (dates.length === 0) {
    return { start: null as Date | null, end: null as Date | null };
  }
  const sorted = sortDates(dates);
  return { start: sorted[0], end: sorted[sorted.length - 1] };
};

export const getCompetenceLabel = (dates: Date[]): string => {
  const { start } = getPeriodBoundaries(dates);
  if (!start) return "—";
  return format(start, "MMMM 'de' yyyy", { locale: ptBR });
};

export const formatPeriodLabel = (dates: Date[]): string => {
  const { start, end } = getPeriodBoundaries(dates);
  if (!start || !end) return "—";
  const startLabel = format(start, "dd/MM/yyyy");
  const endLabel = format(end, "dd/MM/yyyy");
  return startLabel === endLabel ? startLabel : `${startLabel} a ${endLabel}`;
};

const parseBackendDate = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const candidate = value.includes(" ") ? value.split(" ")[0] : value;
  const tries = ["dd-MM-yyyy", "yyyy-MM-dd", "dd/MM/yyyy"];
  for (const pattern of tries) {
    const parsed = parse(candidate, pattern, new Date());
    if (isValid(parsed)) return parsed;
  }
  return null;
};

export const formatBackendDateAsBR = (value: string | null | undefined): string => {
  const date = parseBackendDate(value);
  return date ? format(date, "dd/MM/yyyy") : value ?? "";
};

export const formatBackendDateAsISO = (value: string | null | undefined): string => {
  const date = parseBackendDate(value);
  return date ? format(date, "yyyy-MM-dd") : "";
};

export const getDayOfWeekLabel = (value: string | null | undefined): string => {
  const date = parseBackendDate(value);
  if (!date) return "";
  return format(date, "EEEE", { locale: ptBR });
};

export const isHolidayDate = (value: string | null | undefined): boolean => {
  const date = parseBackendDate(value);
  return date ? isHoliday(date) : false;
};

export const getStatusLabel = (status: string | null | undefined): string => {
  if (!status) return "";
  return getTranslatedStatus(status);
};

export const CATEGORY_LABEL: Record<EventCategory, string> = {
  work: "Horas trabalhadas",
  absence: "Faltas",
  day_off: "Folgas",
  vacation: "Férias",
  time_off: "Abonos",
  pending: "Pendências",
  implicit_break: "Pausas",
  other: "Outros",
};

export const buildTimestamp = (date: Date): string =>
  format(date, "yyyyMMdd_HHmmss");

export const formatGeneratedAt = (date: Date): string =>
  format(date, "dd/MM/yyyy HH:mm");
