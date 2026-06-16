import type { LgpdRequestStatus, LgpdRequestType } from "@/service/lgpd.service";
import { LGPD_REQUEST_TYPE_LABELS } from "@/constants/lgpd.constants";

export interface LgpdStatusTone {
  badge: string;
  dot: string;
  label: string;
}

const STATUS_TONES: Record<LgpdRequestStatus, LgpdStatusTone> = {
  OPEN: {
    label: "Aberto",
    dot: "bg-[#F59E0B]",
    badge: "border border-[#FCD34D] bg-[#FEF3C7] text-[#92400E]",
  },
  IN_ANALYSIS: {
    label: "Em análise",
    dot: "bg-[#2563EB]",
    badge: "border border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
  },
  WAITING_CONTROLLER: {
    label: "Aguardando controlador",
    dot: "bg-[#1E3A8A]",
    badge: "border border-[#BFDBFE] bg-[#EFF6FF] text-[#1E3A8A]",
  },
  WAITING_LEGAL_REVIEW: {
    label: "Aguardando revisão legal",
    dot: "bg-[#F59E0B]",
    badge: "border border-[#FCD34D] bg-[#FEF3C7] text-[#92400E]",
  },
  APPROVED_FOR_EXPORT: {
    label: "Aprovado para exportação",
    dot: "bg-[#16A34A]",
    badge: "border border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D]",
  },
  WAITING_DATA_SUBJECT: {
    label: "Aguardando titular",
    dot: "bg-[#2563EB]",
    badge: "border border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
  },
  COMPLETED: {
    label: "Concluído",
    dot: "bg-[#16A34A]",
    badge: "border border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D]",
  },
  REJECTED: {
    label: "Rejeitado",
    dot: "bg-[#DC2626]",
    badge: "border border-[#FECACA] bg-[#FEE2E2] text-[#B91C1C]",
  },
  PARTIALLY_COMPLETED: {
    label: "Parcialmente concluído",
    dot: "bg-[#F59E0B]",
    badge: "border border-[#FCD34D] bg-[#FEF3C7] text-[#92400E]",
  },
  CANCELLED: {
    label: "Cancelado",
    dot: "bg-[#94A3B8]",
    badge: "border border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]",
  },
};

const NEUTRAL_TONE: LgpdStatusTone = {
  label: "—",
  dot: "bg-[#94A3B8]",
  badge: "border border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]",
};

export const SENSITIVE_TYPES: LgpdRequestType[] = [
  "ANONYMIZATION",
  "DELETION",
  "BLOCKING",
];

export const PRIVACY_TYPES: LgpdRequestType[] = [
  "CONSENT_REVOCATION",
  "CONSENT_INFORMATION",
  "SHARING_INFORMATION",
];

export const getStatusTone = (status: LgpdRequestStatus | string | null | undefined): LgpdStatusTone => {
  if (!status) return NEUTRAL_TONE;
  return STATUS_TONES[status as LgpdRequestStatus] ?? { ...NEUTRAL_TONE, label: status };
};

export const getStatusLabel = (status: LgpdRequestStatus | string | null | undefined): string =>
  getStatusTone(status).label;

export const getTypeLabel = (type: LgpdRequestType | string | null | undefined): string => {
  if (!type) return "—";
  return LGPD_REQUEST_TYPE_LABELS[type as LgpdRequestType] ?? type;
};

export interface LgpdTypeBadgeTone {
  badge: string;
  dot: string;
  kind: "sensitive" | "privacy" | "standard";
}

const SENSITIVE_BADGE: LgpdTypeBadgeTone = {
  kind: "sensitive",
  dot: "bg-[#7C3AED]",
  badge: "border border-[#DDD6FE] bg-[#EDE9FE] text-[#5B21B6]",
};

const PRIVACY_BADGE: LgpdTypeBadgeTone = {
  kind: "privacy",
  dot: "bg-[#0D9488]",
  badge: "border border-[#99F6E4] bg-[#CCFBF1] text-[#0F766E]",
};

const STANDARD_BADGE: LgpdTypeBadgeTone = {
  kind: "standard",
  dot: "bg-[#2563EB]",
  badge: "border border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
};

export const getTypeTone = (type: LgpdRequestType | string | null | undefined): LgpdTypeBadgeTone => {
  if (!type) return STANDARD_BADGE;
  if (SENSITIVE_TYPES.includes(type as LgpdRequestType)) return SENSITIVE_BADGE;
  if (PRIVACY_TYPES.includes(type as LgpdRequestType)) return PRIVACY_BADGE;
  return STANDARD_BADGE;
};

export const formatLgpdDate = (dateString?: string | null): string => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export const getInitials = (name?: string | null): string => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
};

export interface SlaTone {
  label: string;
  badge: string;
  isOverdue: boolean;
  daysSinceCreation: number;
}

const DAY_MS = 1000 * 60 * 60 * 24;

export const getSlaTone = (
  createdAt: string | null | undefined,
  isOverdue: boolean
): SlaTone => {
  let daysSinceCreation = 0;
  if (createdAt) {
    const created = new Date(createdAt);
    if (!Number.isNaN(created.getTime())) {
      daysSinceCreation = Math.max(
        0,
        Math.floor((Date.now() - created.getTime()) / DAY_MS)
      );
    }
  }

  if (isOverdue) {
    return {
      label: "Atraso",
      badge: "border border-[#FECACA] bg-[#FEE2E2] text-[#B91C1C]",
      isOverdue: true,
      daysSinceCreation,
    };
  }

  if (daysSinceCreation === 0) {
    return {
      label: "OK",
      badge: "border border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D]",
      isOverdue: false,
      daysSinceCreation,
    };
  }

  return {
    label: `D+${daysSinceCreation}`,
    badge: "border border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D]",
    isOverdue: false,
    daysSinceCreation,
  };
};

export const isSensitiveType = (type: LgpdRequestType | string | null | undefined): boolean =>
  type ? SENSITIVE_TYPES.includes(type as LgpdRequestType) : false;
