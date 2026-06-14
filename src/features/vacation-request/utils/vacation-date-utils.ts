import { eachDayOfInterval, format, isBefore, isWeekend, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { VacationPeriodSummary } from "../types";

const todayAtStart = () => startOfDay(new Date());

const hasValidDate = (value?: Date): value is Date => value instanceof Date && !Number.isNaN(value.getTime());

export const isVacationDateDisabled = (date: Date) => isBefore(startOfDay(date), todayAtStart());

export const formatVacationDate = (date: Date, pattern = "dd MMM yyyy") =>
  format(startOfDay(date), pattern, { locale: ptBR });

export const formatVacationShortDate = (date: Date) =>
  format(startOfDay(date), "dd MMM", { locale: ptBR });

export const formatVacationWeekday = (date: Date) =>
  format(startOfDay(date), "EEE", { locale: ptBR })
    .replace(/\./g, "")
    .toUpperCase();

export interface VacationRangeDayChip {
  date: Date;
  weekdayLabel: string;
  dayLabel: string;
  isWeekend: boolean;
}

export const getVacationRangeDayChips = (startDate?: Date, endDate?: Date): VacationRangeDayChip[] => {
  if (!hasValidDate(startDate)) {
    return [];
  }

  const safeStart = startOfDay(startDate);
  const safeEnd = hasValidDate(endDate) ? startOfDay(endDate) : safeStart;

  if (isBefore(safeEnd, safeStart)) {
    return [];
  }

  return eachDayOfInterval({ start: safeStart, end: safeEnd }).map((date) => ({
    date,
    weekdayLabel: formatVacationWeekday(date),
    dayLabel: format(date, "d", { locale: ptBR }),
    isWeekend: isWeekend(date),
  }));
};

export const getVacationPeriodSummary = (startDate?: Date, endDate?: Date): VacationPeriodSummary => {
  if (!hasValidDate(startDate) && !hasValidDate(endDate)) {
    return {
      startLabel: "Selecione",
      endLabel: "Selecione",
      periodLabel: "Selecione o período solicitado",
      dayCount: 0,
      businessDays: 0,
      weekendCount: 0,
      isValid: false,
    };
  }

  if (!hasValidDate(startDate)) {
    return {
      startLabel: "Selecione",
      endLabel: hasValidDate(endDate) ? formatVacationDate(endDate) : "Selecione",
      periodLabel: "Selecione a data inicial",
      dayCount: 0,
      businessDays: 0,
      weekendCount: 0,
      isValid: false,
    };
  }

  if (!hasValidDate(endDate)) {
    return {
      startLabel: formatVacationDate(startDate),
      endLabel: "Selecione",
      periodLabel: `${formatVacationDate(startDate)} → ...`,
      dayCount: 0,
      businessDays: 0,
      weekendCount: 0,
      isValid: false,
    };
  }

  const safeStart = startOfDay(startDate);
  const safeEnd = startOfDay(endDate);

  if (isBefore(safeEnd, safeStart)) {
    return {
      startLabel: formatVacationDate(startDate),
      endLabel: formatVacationDate(endDate),
      periodLabel: `${formatVacationDate(startDate)} → ${formatVacationDate(endDate)}`,
      dayCount: 0,
      businessDays: 0,
      weekendCount: 0,
      isValid: false,
    };
  }

  const days = eachDayOfInterval({ start: safeStart, end: safeEnd });
  const weekendDays = days.filter((date) => isWeekend(date)).length;
  const weekendCount = weekendDays > 0 ? Math.max(1, Math.ceil(weekendDays / 2)) : 0;
  const totalDays = days.length;
  const businessDays = Math.max(totalDays - weekendDays, 0);

  return {
    startLabel: formatVacationDate(startDate),
    endLabel: formatVacationDate(endDate),
    periodLabel: `${formatVacationShortDate(startDate)} → ${formatVacationShortDate(endDate)}`,
    dayCount: totalDays,
    businessDays,
    weekendCount,
    isValid: true,
  };
};

export const isVacationPeriodPastOnly = (startDate?: Date, endDate?: Date) =>
  Boolean(
    (hasValidDate(startDate) && isVacationDateDisabled(startDate)) ||
      (hasValidDate(endDate) && isVacationDateDisabled(endDate))
  );

