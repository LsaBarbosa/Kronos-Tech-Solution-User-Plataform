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

export const ANONYMIZATION_RESOURCE_TYPE_LABELS: Record<string, string> = {
  TIME_RECORD: "Registros de Ponto",
  USER: "Conta de Usuário",
  DOCUMENT: "Documentos Armazenados",
  BIOMETRIC_ARTIFACT: "Dados Biométricos",
  EMPLOYEE: "Dados do Colaborador",
  MESSAGE: "Mensagens",
  AUDIT_LOG: "Registros de Auditoria",
};

export const ANONYMIZATION_ACTION_DESCRIPTIONS: Record<string, string> = {
  REMOVE_PRECISE_GEOLOCATION: "Remover geolocalização precisa dos registros",
  ANONYMIZE_AND_DEACTIVATE: "Anonimizar conta e invalidar acesso",
  DELETE_AND_ANONYMIZE: "Remover arquivo do armazenamento",
  DELETE_FACE_IMAGES: "Remover imagens faciais do sistema",
  ANONYMIZE_EMPLOYEE_RECORD: "Anonimizar dados pessoais do colaborador",
  ANONYMIZE_MESSAGE_CONTENT: "Anonimizar conteúdo de mensagens",
  MASK_SENSITIVE_DATA: "Mascarar dados sensíveis nos registros",
};
