import type { LgpdRequestStatus, LgpdRequestType } from "@/service/lgpd.service";

export const EXPORTABLE_REQUEST_TYPES: LgpdRequestType[] = [
  "ACCESS",
  "PORTABILITY",
  "SHARING_INFORMATION",
  "CONFIRM_PROCESSING",
];

export const CLOSED_STATUSES: LgpdRequestStatus[] = [
  "COMPLETED",
  "REJECTED",
  "PARTIALLY_COMPLETED",
  "CANCELLED",
];

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

export const isExportableType = (type: string | null | undefined): type is LgpdRequestType =>
  Boolean(type) && EXPORTABLE_REQUEST_TYPES.includes(type as LgpdRequestType);

export const isClosedStatus = (status: LgpdRequestStatus | string | null | undefined): boolean =>
  Boolean(status) && CLOSED_STATUSES.includes(status as LgpdRequestStatus);

export const isSensitiveType = (type: LgpdRequestType | string | null | undefined): boolean =>
  Boolean(type) && SENSITIVE_TYPES.includes(type as LgpdRequestType);

export interface PrimaryAction {
  label: string;
  nextStatus: LgpdRequestStatus;
  description: string;
  publicNotes: string;
  internalNotes: string;
  hint: string;
  requiresJustification: boolean;
}

export const getPrimaryAction = (
  status: LgpdRequestStatus | string,
  type: LgpdRequestType | string
): PrimaryAction | null => {
  switch (status) {
    case "OPEN":
      return {
        label: "Iniciar análise",
        nextStatus: "IN_ANALYSIS",
        description: "Marca a solicitação como em análise pela empresa.",
        publicNotes: "Solicitação recebida e análise iniciada pela empresa.",
        internalNotes: "Administrador iniciou a análise administrativa da solicitação LGPD.",
        hint: "Próximo passo: registrar evidências da análise.",
        requiresJustification: false,
      };
    case "IN_ANALYSIS":
      return {
        label: "Enviar para revisão do controlador",
        nextStatus: "WAITING_CONTROLLER",
        description: "Encaminha a solicitação para validação da empresa controladora.",
        publicNotes: "Solicitação encaminhada para revisão da empresa controladora.",
        internalNotes: "Identidade, vínculo e escopo serão validados pela controladora.",
        hint: "Controladora valida identidade e escopo antes da revisão legal.",
        requiresJustification: false,
      };
    case "WAITING_CONTROLLER":
      return {
        label: "Enviar para revisão legal",
        nextStatus: "WAITING_LEGAL_REVIEW",
        description: "Encaminha a solicitação para revisão legal antes da aprovação.",
        publicNotes: "Solicitação encaminhada para revisão legal.",
        internalNotes: "Controladora concluiu a revisão inicial e solicitou validação legal.",
        hint: "Time legal valida base e fundamentos antes da próxima decisão.",
        requiresJustification: false,
      };
    case "WAITING_LEGAL_REVIEW":
      if (isExportableType(type)) {
        return {
          label: "Aprovar exportação",
          nextStatus: "APPROVED_FOR_EXPORT",
          description: "Aprova a geração do pacote de dados do titular.",
          publicNotes:
            "Solicitação aprovada pela empresa controladora para exportação dos dados pessoais solicitados.",
          internalNotes: "Identidade e vínculo validados pelo administrador da empresa.",
          hint: "Aprovar exportação após revisão legal.",
          requiresJustification: true,
        };
      }
      return {
        label: "Concluir solicitação",
        nextStatus: "COMPLETED",
        description: "Conclui a solicitação sem exportação de arquivo.",
        publicNotes: "Solicitação atendida conforme análise LGPD.",
        internalNotes: "Solicitação concluída sem necessidade de pacote de exportação.",
        hint: "Solicitação não exportável: registrar a nota pública e concluir.",
        requiresJustification: true,
      };
    default:
      return null;
  }
};

export interface WorkflowStep {
  label: string;
  statuses: LgpdRequestStatus[];
  current: boolean;
  completed: boolean;
}

const buildSteps = (
  status: LgpdRequestStatus | string,
  exportable: boolean
): Omit<WorkflowStep, "current" | "completed">[] => {
  if (!exportable) {
    return [
      { label: "Aberta", statuses: ["OPEN"] },
      { label: "Em análise", statuses: ["IN_ANALYSIS"] },
      {
        label: "Revisão",
        statuses: ["WAITING_CONTROLLER", "WAITING_LEGAL_REVIEW", "WAITING_DATA_SUBJECT"],
      },
      { label: "Conclusão", statuses: ["COMPLETED", "PARTIALLY_COMPLETED"] },
    ];
  }
  return [
    { label: "Aberta", statuses: ["OPEN"] },
    { label: "Em análise", statuses: ["IN_ANALYSIS"] },
    { label: "Controlador", statuses: ["WAITING_CONTROLLER"] },
    { label: "Revisão legal", statuses: ["WAITING_LEGAL_REVIEW", "WAITING_DATA_SUBJECT"] },
    { label: "Exportação", statuses: ["APPROVED_FOR_EXPORT"] },
    { label: "Conclusão", statuses: ["COMPLETED", "PARTIALLY_COMPLETED"] },
  ];
};

export const getWorkflowSteps = (
  status: LgpdRequestStatus | string,
  type: LgpdRequestType | string
): WorkflowStep[] => {
  const exportable = isExportableType(type);
  const baseSteps = buildSteps(status, exportable);
  const currentIndex = baseSteps.findIndex((step) =>
    step.statuses.includes(status as LgpdRequestStatus)
  );

  return baseSteps.map((step, index) => ({
    ...step,
    current: index === currentIndex,
    completed: currentIndex >= 0 && index < currentIndex,
  }));
};

export const canRoleCancel = (role: string | null | undefined): boolean => role === "CTO";

export const filterAdvancedTransitions = (
  transitions: LgpdRequestStatus[],
  role: string | null | undefined
): LgpdRequestStatus[] => transitions.filter((status) => role === "CTO" || status !== "CANCELLED");

export const formatLgpdDateTime = (value?: string | Date | null): string => {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatLgpdDate = (value?: string | Date | null): string => {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
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

export const getShortRequestCode = (requestId: string): string => {
  if (!requestId) return "—";
  return requestId.slice(0, 8).toUpperCase();
};
