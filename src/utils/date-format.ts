const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const BACKEND_DATE_PATTERN = /^\d{2}-\d{2}-\d{4}$/;

export const toBackendDatePattern = (isoDate: string): string => {
  const normalized = isoDate.trim();

  if (!ISO_DATE_PATTERN.test(normalized)) {
    throw new Error("Data inválida.");
  }

  const [year, month, day] = normalized.split("-");

  if (!year || !month || !day) {
    throw new Error("Data inválida.");
  }

  return `${day}-${month}-${year}`;
};

export const ensureBackendDatePattern = (date: string): string => {
  const normalized = date.trim();

  if (BACKEND_DATE_PATTERN.test(normalized)) {
    return normalized;
  }

  return toBackendDatePattern(normalized);
};

export const dateToBackendDatePattern = (date: Date): string => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error("Data inválida.");
  }

  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return toBackendDatePattern(`${year}-${month}-${day}`);
};
