import type { CollaboratorEditorDraft, CollaboratorRecord, CollaboratorSummary, CollaboratorTone } from "../types/collaborator-view.types";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export const SCHEDULE_TYPES = [
  { value: "TRADITIONAL_5X2", label: "Tradicional 5x2 (Seg-Sex)" },
  { value: "SIX_BY_ONE_FIXED", label: "6x1 com folga fixa" },
  { value: "ROTATING_12X36", label: "Plantão 12x36" },
  { value: "ROTATING_24X72", label: "Plantão 24x72" },
  { value: "SIX_BY_ONE_TWO_WEEKENDS", label: "6x1 + 2 finais de semana" },
  { value: "SIX_BY_ONE_ONE_WEEKEND", label: "6x1 + 1 final de semana" },
  { value: "CUSTOM_DAYS", label: "Dias de trabalho" },
] as const;

export const DAYS_OF_WEEK = [
  { value: "MONDAY", label: "Segunda-feira", short: "Seg" },
  { value: "TUESDAY", label: "Terça-feira", short: "Ter" },
  { value: "WEDNESDAY", label: "Quarta-feira", short: "Qua" },
  { value: "THURSDAY", label: "Quinta-feira", short: "Qui" },
  { value: "FRIDAY", label: "Sexta-feira", short: "Sex" },
  { value: "SATURDAY", label: "Sábado", short: "Sáb" },
  { value: "SUNDAY", label: "Domingo", short: "Dom" },
] as const;

const STATUS_LABELS: Record<string, string> = {
  MANAGER: "Administrador",
  PARTNER: "Colaborador",
};

export const formatCurrency = (value: number) => currencyFormatter.format(value);

export const formatPhone = (phone: string) => {
  const digits = (phone || "").replace(/\D/g, "");

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return phone;
};

export const formatAddress = (address?: CollaboratorRecord["address"] | null) => {
  if (!address) {
    return "Endereço não informado";
  }

  return `${address.street}, ${address.number} - ${address.city}/${address.state} - CEP ${address.postalCode}`;
};

export const formatShortAddress = (address?: CollaboratorRecord["address"] | null) => {
  if (!address) {
    return "Endereço não informado";
  }

  return `${address.city}/${address.state}`;
};

export const formatScheduleLabel = (record: Pick<CollaboratorRecord, "scheduleType" | "workStartTime" | "workEndTime" | "homeOffice" | "preferredDayOff" | "fixedWorkDays">) => {
  const schedule = SCHEDULE_TYPES.find((item) => item.value === record.scheduleType)?.label ?? "Escala não informada";
  const timeRange =
    record.workStartTime && record.workEndTime
      ? `${record.workStartTime} - ${record.workEndTime}`
      : "Horários não informados";

  const detail = record.homeOffice ? "Home office" : timeRange;

  if (record.preferredDayOff) {
    const day = DAYS_OF_WEEK.find((item) => item.value === record.preferredDayOff)?.short ?? record.preferredDayOff;
    return `${schedule} · ${detail} · Folga ${day}`;
  }

  if (record.fixedWorkDays && record.fixedWorkDays.length > 0) {
    const days = record.fixedWorkDays
      .map((day) => DAYS_OF_WEEK.find((item) => item.value === day)?.short ?? day.slice(0, 3))
      .join(", ");
    return `${schedule} · ${detail} · ${days}`;
  }

  return `${schedule} · ${detail}`;
};

export const getRoleLabel = (role?: CollaboratorRecord["role"]) => {
  if (!role) {
    return "Sem usuário";
  }

  return STATUS_LABELS[role] ?? role;
};

export const getInitials = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "KR";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
};

export const getToneClass = (tone: CollaboratorTone) => {
  switch (tone) {
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "danger":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "neutral":
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
};

export const getStatusTone = (active: boolean): CollaboratorTone => (active ? "success" : "danger");

export const getBiometricTone = (state: CollaboratorRecord["biometricState"]): CollaboratorTone => {
  if (state === "registered") {
    return "success";
  }

  if (state === "pending") {
    return "warning";
  }

  return "neutral";
};

export const getBiometricLabel = (state: CollaboratorRecord["biometricState"]) => {
  if (state === "registered") {
    return "Biometria cadastrada";
  }

  if (state === "pending") {
    return "Biometria pendente";
  }

  return "Biometria não informada";
};

export const getAccountLabel = (hasAccount: boolean, username: string) =>
  hasAccount ? username : "Conta sem usuário";

export const createCollaboratorEditorDraft = (record: CollaboratorRecord): CollaboratorEditorDraft => ({
  fullName: record.fullName ?? "",
  maskedCpf: record.maskedCpf ?? "",
  pis: record.pis ?? "",
  jobPosition: record.jobPosition ?? "",
  email: record.email ?? "",
  salary: record.salary?.toString() ?? "",
  phone: record.phone ?? "",
  postalCode: record.address?.postalCode ?? "",
  number: record.address?.number ?? "",
  username: record.username ?? "",
  role: record.role ?? "",
  homeOffice: Boolean(record.homeOffice),
  workStartTime: record.workStartTime ?? "",
  workEndTime: record.workEndTime ?? "",
  breakStartTime: record.breakStartTime ?? "",
  breakEndTime: record.breakEndTime ?? "",
  scheduleType: record.scheduleType ?? "",
  scaleStartDate: record.scaleStartDate ?? "",
  preferredDayOff: record.preferredDayOff ?? "",
  weekendOffIndex: record.weekendOffIndex?.toString() ?? "",
  fixedWorkDays: record.fixedWorkDays ?? [],
});

export const buildCollaboratorSummary = (records: CollaboratorRecord[]): CollaboratorSummary => {
  const active = records.filter((item) => item.active).length;
  const inactive = records.filter((item) => !item.active).length;
  const managers = records.filter((item) => item.role === "MANAGER").length;
  const homeOffice = records.filter((item) => item.homeOffice).length;
  const noAccount = records.filter((item) => !item.hasAccount).length;
  const biometricPending = records.filter((item) => item.biometricState === "pending").length;

  return {
    active,
    inactive,
    managers,
    homeOffice,
    noAccount,
    biometricPending,
  };
};

export const matchesCollaboratorFilters = (
  record: CollaboratorRecord,
  search: string
) => {
  const query = search.trim().toLowerCase();

  if (!query) {
    return true;
  }

  return [
    record.fullName,
    record.username,
    record.jobPosition,
    record.companyName,
    record.email,
    record.maskedCpf,
  ]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(query));
};

export const buildDetailSummary = (record: CollaboratorRecord) => {
  const role = record.roleLabel;
  const account = record.hasAccount ? `Conta ${record.username}` : "Sem usuário vinculado";
  const access = record.active ? "Acesso ativo" : "Acesso inativo";
  return `${role} · ${account} · ${access}`;
};

export const createCollaboratorTitle = (record: CollaboratorRecord) =>
  `${record.fullName} · ${record.jobPosition}`;
