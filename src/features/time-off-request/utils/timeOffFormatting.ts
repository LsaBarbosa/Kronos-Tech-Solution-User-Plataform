import { differenceInCalendarDays, format, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { TimeOffRequestPeriodSummary, TimeOffRequestType } from "../types";

const formatDatePart = (date: Date, pattern: string) => format(startOfDay(date), pattern, { locale: ptBR });

export const formatTimeOffDate = (date: Date, pattern = "dd MMM yyyy") => formatDatePart(date, pattern);

export const formatTimeOffShortDate = (date: Date) => formatDatePart(date, "dd MMM");

export const formatTimeOffMonthLabel = (date: Date) =>
  formatDatePart(date, "MMMM yyyy").replace(/^./, (value) => value.toUpperCase());

export const formatTimeOffWeekday = (date: Date) =>
  formatDatePart(date, "EEE").replace(/\./g, "").toUpperCase();

export const formatTimeOffTime = (value: string) => value || "--:--";

export const formatTimeOffTypeLabel = (type: TimeOffRequestType | "") => {
  if (type === "TIME_OFF_REQUEST") {
    return "Abono de horas";
  }

  if (type === "FORGOTTEN_REGISTRATION") {
    return "Esquecimento de ponto";
  }

  return "Selecione o tipo";
};

export const formatTimeOffTypeDescription = (type: TimeOffRequestType | "") => {
  if (type === "TIME_OFF_REQUEST") {
    return "Atestado, folga acordada ou justificativa médica.";
  }

  if (type === "FORGOTTEN_REGISTRATION") {
    return "Correção quando a marcação não foi registrada.";
  }

  return "Escolha o tipo de ajuste antes de continuar.";
};

export const formatTimeOffFileSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export const formatTimeOffFileTypeLabel = (file: File) => {
  const normalizedMime = file.type.toLowerCase();
  const lowerName = file.name.toLowerCase();

  if (normalizedMime === "application/pdf" || lowerName.endsWith(".pdf")) {
    return "PDF";
  }

  if (normalizedMime === "image/jpeg" || lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
    return "JPG";
  }

  if (normalizedMime === "image/png" || lowerName.endsWith(".png")) {
    return "PNG";
  }

  if (normalizedMime) {
    return normalizedMime.toUpperCase();
  }

  const extension = file.name.split(".").pop()?.toUpperCase();
  return extension || "Arquivo";
};

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map((part) => Number(part));
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return NaN;
  }

  return hours * 60 + minutes;
};

export const getTimeOffPeriodSummary = (startDate?: Date, endDate?: Date, startHour = "", endHour = ""): TimeOffRequestPeriodSummary => {
  if (!startDate || Number.isNaN(startDate.getTime())) {
    return {
      startLabel: "Selecione",
      endLabel: "Selecione",
      periodLabel: "Selecione o período solicitado",
      timeLabel: "Selecione as horas",
      dayCount: 0,
      totalMinutes: 0,
      hasSameDay: false,
      isValid: false,
    };
  }

  if (!endDate || Number.isNaN(endDate.getTime())) {
    return {
      startLabel: formatTimeOffDate(startDate),
      endLabel: "Selecione",
      periodLabel: `${formatTimeOffDate(startDate)} → ...`,
      timeLabel: `${formatTimeOffTime(startHour)} às ${formatTimeOffTime(endHour)}`,
      dayCount: 0,
      totalMinutes: 0,
      hasSameDay: false,
      isValid: false,
    };
  }

  const safeStart = startOfDay(startDate);
  const safeEnd = startOfDay(endDate);
  const dayCount = differenceInCalendarDays(safeEnd, safeStart) + 1;
  const hasSameDay = dayCount === 1;
  const startMinutes = toMinutes(startHour);
  const endMinutes = toMinutes(endHour);
  const totalMinutes = Number.isFinite(startMinutes) && Number.isFinite(endMinutes) ? Math.max(endMinutes - startMinutes, 0) : 0;

  if (dayCount <= 0) {
    return {
      startLabel: formatTimeOffDate(startDate),
      endLabel: formatTimeOffDate(endDate),
      periodLabel: `${formatTimeOffDate(startDate)} → ${formatTimeOffDate(endDate)}`,
      timeLabel: `${formatTimeOffTime(startHour)} às ${formatTimeOffTime(endHour)}`,
      dayCount: 0,
      totalMinutes: 0,
      hasSameDay,
      isValid: false,
    };
  }

  return {
    startLabel: formatTimeOffDate(startDate),
    endLabel: formatTimeOffDate(endDate),
    periodLabel: `${formatTimeOffShortDate(startDate)} → ${formatTimeOffShortDate(endDate)}`,
    timeLabel: `${formatTimeOffTime(startHour)} às ${formatTimeOffTime(endHour)}`,
    dayCount,
    totalMinutes,
    hasSameDay,
    isValid: Boolean(startHour && endHour && totalMinutes > 0),
  };
};

export const formatTimeOffDurationLabel = (summary: TimeOffRequestPeriodSummary) => {
  if (!summary.isValid) {
    return "Aguardando dados";
  }

  const hours = Math.floor(summary.totalMinutes / 60);
  const minutes = summary.totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h${String(minutes).padStart(2, "0")}`;
};
