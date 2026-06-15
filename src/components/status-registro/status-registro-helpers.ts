import type { LucideIcon } from "lucide-react";
import { CalendarCheck, CalendarOff, CircleSlash, Sparkles } from "lucide-react";

export const TARGET_STATUS_VALUES = ["ABSENCE", "DAY_OFF", "TIME_OFF"] as const;
export type TargetStatus = (typeof TARGET_STATUS_VALUES)[number];

export interface StatusTone {
  label: string;
  badgeClass: string;
  dotClass: string;
  textClass: string;
  cardAccent: string;
}

const NEUTRAL_TONE: StatusTone = {
  label: "—",
  badgeClass: "border border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]",
  dotClass: "bg-[#94A3B8]",
  textClass: "text-[#475569]",
  cardAccent: "border-[#E2E8F0]",
};

const STATUS_TONES: Record<string, StatusTone> = {
  CREATED: {
    label: "Criado",
    badgeClass: "border border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D]",
    dotClass: "bg-[#16A34A]",
    textClass: "text-[#15803D]",
    cardAccent: "border-[#16A34A]",
  },
  UPDATED: {
    label: "Atualizado por ADM",
    badgeClass: "border border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
    dotClass: "bg-[#2563EB]",
    textClass: "text-[#1D4ED8]",
    cardAccent: "border-[#2563EB]",
  },
  DAY_OFF: {
    label: "Folga",
    badgeClass: "border border-[#99F6E4] bg-[#CCFBF1] text-[#0F766E]",
    dotClass: "bg-[#0D9488]",
    textClass: "text-[#0F766E]",
    cardAccent: "border-[#0D9488]",
  },
  ABSENCE: {
    label: "Falta",
    badgeClass: "border border-[#FECACA] bg-[#FEE2E2] text-[#B91C1C]",
    dotClass: "bg-[#DC2626]",
    textClass: "text-[#B91C1C]",
    cardAccent: "border-[#DC2626]",
  },
  TIME_OFF: {
    label: "Abono",
    badgeClass: "border border-[#DDD6FE] bg-[#EDE9FE] text-[#5B21B6]",
    dotClass: "bg-[#7C3AED]",
    textClass: "text-[#5B21B6]",
    cardAccent: "border-[#7C3AED]",
  },
  PENDING: {
    label: "Saída pendente",
    badgeClass: "border border-[#FCD34D] bg-[#FEF3C7] text-[#92400E]",
    dotClass: "bg-[#F59E0B]",
    textClass: "text-[#92400E]",
    cardAccent: "border-[#F59E0B]",
  },
  TIME_OFF_REQUEST: {
    label: "Abono pendente",
    badgeClass: "border border-[#FCD34D] bg-[#FEF3C7] text-[#92400E]",
    dotClass: "bg-[#F59E0B]",
    textClass: "text-[#92400E]",
    cardAccent: "border-[#F59E0B]",
  },
  TIME_OFF_REJECTED: {
    label: "Abono rejeitado",
    badgeClass: "border border-[#FECACA] bg-[#FEE2E2] text-[#B91C1C]",
    dotClass: "bg-[#DC2626]",
    textClass: "text-[#B91C1C]",
    cardAccent: "border-[#DC2626]",
  },
  WORK_TIME_REQUEST: {
    label: "Ajuste pendente",
    badgeClass: "border border-[#FCD34D] bg-[#FEF3C7] text-[#92400E]",
    dotClass: "bg-[#F59E0B]",
    textClass: "text-[#92400E]",
    cardAccent: "border-[#F59E0B]",
  },
  WORK_TIME_REJECTED: {
    label: "Ajuste rejeitado",
    badgeClass: "border border-[#FECACA] bg-[#FEE2E2] text-[#B91C1C]",
    dotClass: "bg-[#DC2626]",
    textClass: "text-[#B91C1C]",
    cardAccent: "border-[#DC2626]",
  },
  UPDATE_REJECTED: {
    label: "Atualização rejeitada",
    badgeClass: "border border-[#FECACA] bg-[#FEE2E2] text-[#B91C1C]",
    dotClass: "bg-[#DC2626]",
    textClass: "text-[#B91C1C]",
    cardAccent: "border-[#DC2626]",
  },
  VACATION: {
    label: "Férias",
    badgeClass: "border border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
    dotClass: "bg-[#2563EB]",
    textClass: "text-[#1D4ED8]",
    cardAccent: "border-[#2563EB]",
  },
  IMPLICIT_BREAK: {
    label: "Pausa",
    badgeClass: "border border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]",
    dotClass: "bg-[#94A3B8]",
    textClass: "text-[#475569]",
    cardAccent: "border-[#94A3B8]",
  },
};

export const getStatusTone = (status: string | undefined | null): StatusTone =>
  status ? STATUS_TONES[status] ?? { ...NEUTRAL_TONE, label: status } : NEUTRAL_TONE;

export const getStatusLabel = (status: string | undefined | null) =>
  getStatusTone(status).label;

export interface ContextStatusCard {
  status: "CREATED" | "DAY_OFF" | "ABSENCE" | "TIME_OFF";
  title: string;
  description: string;
  icon: LucideIcon;
  tone: string;
}

export const CONTEXT_STATUS_CARDS: ContextStatusCard[] = [
  {
    status: "CREATED",
    title: "Criado",
    description: "Origem do registro. Marcações automáticas ou pelo colaborador.",
    icon: Sparkles,
    tone: "from-[#15803D] to-[#16A34A]",
  },
  {
    status: "DAY_OFF",
    title: "Folga",
    description: "Sem expediente previsto para o dia. Sem impacto em saldo.",
    icon: CalendarCheck,
    tone: "from-[#0F766E] to-[#0D9488]",
  },
  {
    status: "ABSENCE",
    title: "Falta",
    description: "Ausência injustificada. Impacta saldo e indicadores do colaborador.",
    icon: CalendarOff,
    tone: "from-[#B91C1C] to-[#DC2626]",
  },
  {
    status: "TIME_OFF",
    title: "Abono",
    description: "Horas abonadas. Substitui falta sem descontar do banco de horas.",
    icon: CircleSlash,
    tone: "from-[#5B21B6] to-[#7C3AED]",
  },
];

export interface SearchStatusOption {
  value: string;
  label: string;
  tone: StatusTone;
}

export const SEARCH_STATUS_OPTIONS: SearchStatusOption[] = [
  "CREATED",
  "UPDATED",
  "DAY_OFF",
  "ABSENCE",
  "TIME_OFF",
  "PENDING",
  "TIME_OFF_REQUEST",
  "TIME_OFF_REJECTED",
  "WORK_TIME_REQUEST",
  "WORK_TIME_REJECTED",
  "VACATION",
].map((value) => ({
  value,
  label: getStatusLabel(value),
  tone: getStatusTone(value),
}));

export const TARGET_STATUS_OPTIONS: Array<{
  value: TargetStatus;
  label: string;
  description: string;
  tone: StatusTone;
}> = [
  {
    value: "ABSENCE",
    label: "Falta",
    description: "Marca o registro como falta injustificada.",
    tone: getStatusTone("ABSENCE"),
  },
  {
    value: "DAY_OFF",
    label: "Folga",
    description: "Marca como folga prevista (sem impacto em saldo).",
    tone: getStatusTone("DAY_OFF"),
  },
  {
    value: "TIME_OFF",
    label: "Abono",
    description: "Marca como abono de horas.",
    tone: getStatusTone("TIME_OFF"),
  },
];

export const isTargetStatus = (value: string | null | undefined): value is TargetStatus =>
  typeof value === "string" && (TARGET_STATUS_VALUES as readonly string[]).includes(value);

export const formatRecordDate = (input: string | undefined | null): string => {
  if (!input) return "—";
  const [datePart] = input.split(" ");
  const segments = datePart.split(/[-/.]/);
  if (segments.length !== 3) return input;
  const [day, month, year] = segments;
  const shortYear = year.length === 4 ? year.slice(-2) : year;
  return `${day}/${month}/${shortYear}`;
};

export const formatDateForBackend = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const getInitials = (name: string): string => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
};
