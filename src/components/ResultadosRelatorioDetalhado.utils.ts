import type { DetailedReportItem } from "@/utils/report-utils";

export const parseBalanceToMinutes = (balanceStr: string): number => {
  if (!balanceStr || balanceStr === "00:00" || balanceStr.length < 5) return 0;

  const cleanStr = balanceStr.trim();
  const sign = cleanStr.startsWith("-") ? -1 : 1;
  const timePart = cleanStr.replace(/[+-]/, "");
  const [hours, minutes] = timePart.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;

  return sign * (hours * 60 + minutes);
};

export const parseTimeToMinutes = (timeStr: string): number => {
  if (!timeStr || timeStr === "00:00" || timeStr.length < 5) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;
  return hours * 60 + minutes;
};

export const formatMinutesToBalance = (totalMinutes: number): string => {
  const sign = totalMinutes < 0 ? "-" : "+";
  const absMinutes = Math.abs(totalMinutes);
  const hours = Math.floor(absMinutes / 60);
  const minutes = absMinutes % 60;

  return `${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

export const formatMinutesToTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

export const formatCoordinates = (latitude?: number | null, longitude?: number | null) => {
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    return "Localização indisponível";
  }

  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
};

export const groupRecordsByDate = (records: DetailedReportItem[]) => {
  const groups: Record<string, DetailedReportItem[]> = {};

  records.forEach((record) => {
    const dateKey = record.startWork;
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(record);
  });

  return Object.entries(groups);
};
