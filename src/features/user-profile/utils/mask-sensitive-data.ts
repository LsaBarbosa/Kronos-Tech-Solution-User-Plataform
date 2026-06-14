const ONLY_DIGITS_REGEX = /\D/g;

export const onlyDigits = (value?: string | null): string => (value ?? "").replace(ONLY_DIGITS_REGEX, "");

export const maskCpfValue = (value?: string | null): string => {
  const trimmed = value?.trim();

  if (!trimmed) {
    return "Nao informado";
  }

  if (trimmed.includes("*")) {
    return trimmed;
  }

  const digits = onlyDigits(trimmed);

  if (digits.length !== 11) {
    return trimmed;
  }

  return `${digits.slice(0, 3)}.***.***-${digits.slice(-2)}`;
};

export const formatPhoneValue = (value?: string | null): string => {
  const trimmed = value?.trim();

  if (!trimmed) {
    return "Nao informado";
  }

  const digits = onlyDigits(trimmed);

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return trimmed;
};

export const maskSalaryValue = (salary?: number | null): string => {
  if (salary === undefined || salary === null) {
    return "Protegida";
  }

  return "R$ ••••••";
};

export const shortHashValue = (
  value?: string | null,
  visiblePrefix = 6,
  visibleSuffix = 4
): string => {
  const trimmed = value?.trim();

  if (!trimmed) {
    return "Nao informado";
  }

  const normalized = trimmed.replace(/\s+/g, "");

  if (normalized.length <= visiblePrefix + visibleSuffix + 1) {
    return normalized;
  }

  return `${normalized.slice(0, visiblePrefix)}...${normalized.slice(-visibleSuffix)}`;
};

export const getInitialsValue = (value?: string | null): string => {
  const trimmed = value?.trim();

  if (!trimmed) {
    return "K";
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "K";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
};

