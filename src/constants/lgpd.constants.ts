import type { LgpdRequestType } from "@/service/lgpd.service";

export const LGPD_REQUEST_TYPE_LABELS: Record<LgpdRequestType, string> = {
  CONFIRM_PROCESSING: "Confirmação de tratamento",
  ACCESS: "Acesso aos meus dados",
  CORRECTION: "Correção de dados",
  ANONYMIZATION: "Anonimização",
  BLOCKING: "Bloqueio de tratamento",
  DELETION: "Exclusão de dados",
  PORTABILITY: "Portabilidade de dados",
  CONSENT_REVOCATION: "Revogação de consentimento",
  SHARING_INFORMATION: "Informações sobre compartilhamento",
  CONSENT_INFORMATION: "Informações sobre consentimento",
  OPPOSITION: "Oposição ao tratamento",
  AUTOMATED_DECISION_REVIEW: "Revisão de decisão automatizada",
};

export const LGPD_REQUEST_TYPES: LgpdRequestType[] = [
  "CONFIRM_PROCESSING",
  "ACCESS",
  "CORRECTION",
  "ANONYMIZATION",
  "BLOCKING",
  "DELETION",
  "PORTABILITY",
  "CONSENT_REVOCATION",
  "SHARING_INFORMATION",
  "CONSENT_INFORMATION",
  "OPPOSITION",
  "AUTOMATED_DECISION_REVIEW",
];
