import type {
  BiometricConsentStatus,
  ConsentHistoryResponse,
  CurrentLegalTextResponse,
  DataCategory,
  DataProcessingPurpose,
} from "@/types/legal";
import { onlyDigits, formatPhoneValue, maskCpfValue, maskSalaryValue, shortHashValue } from "./mask-sensitive-data";

export const formatDateTimeBR = (value?: string | null): string => {
  const trimmed = value?.trim();

  if (!trimmed) {
    return "Nao informado";
  }

  const date = new Date(trimmed);

  if (Number.isNaN(date.getTime())) {
    return trimmed;
  }

  return date.toLocaleString("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export const formatDateBR = (value?: string | null): string => {
  const trimmed = value?.trim();

  if (!trimmed) {
    return "Nao informado";
  }

  const date = new Date(trimmed);

  if (Number.isNaN(date.getTime())) {
    return trimmed;
  }

  return date.toLocaleDateString("pt-BR", {
    dateStyle: "medium",
  });
};

export const getRoleLabel = (role?: string | null): string => {
  switch ((role ?? "").toUpperCase()) {
    case "CTO":
      return "Diretoria";
    case "MANAGER":
      return "Gestao";
    case "PARTNER":
      return "Colaborador";
    default:
      return role?.trim() ? role : "Nao informado";
  }
};

export const getAccountStatusLabel = (active?: boolean | null): string =>
  active === false ? "Conta inativa" : "Conta ativa";

export const getAccountStatusTone = (active?: boolean | null): "active" | "inactive" =>
  active === false ? "inactive" : "active";

export const getBiometricConsentTone = (status?: BiometricConsentStatus | null): "active" | "pending" => {
  if (!status) {
    return "pending";
  }

  return status.biometricConsentAccepted && !status.requiresNewAcceptance ? "active" : "pending";
};

export const getBiometricConsentLabel = (status?: BiometricConsentStatus | null): string => {
  if (!status) {
    return "Consentimento nao carregado";
  }

  if (status.biometricConsentAccepted && !status.requiresNewAcceptance) {
    return "Consentimento biometrico ativo";
  }

  return "Consentimento biometrico pendente";
};

export const getConsentHistoryStatusTone = (status?: string | null): "active" | "inactive" =>
  status === "ATIVO" ? "active" : "inactive";

export const getConsentHistoryStatusLabel = (status?: string | null): string =>
  status === "ATIVO" ? "Ativo" : "Revogado";

export const getConsentHistoryTypeLabel = (type?: string | null): string => {
  if (!type) {
    return "Nao informado";
  }

  const labels: Record<string, string> = {
    BIOMETRIC_AUTHENTICATION: "Autenticacao biometrica",
    BIOMETRIC_TIME_RECORD: "Ponto biometrico",
    PRIVACY_POLICY: "Politica de privacidade",
    TERMS_OF_USE: "Termos de uso",
  };

  return labels[type] ?? type;
};

export const getDataProcessingCategoryLabel = (dataCategory: DataCategory): string => {
  const categoryLabels: Record<string, string> = {
    IDENTIFICATION: "Identificacao",
    CONTACT: "Contato",
    EMPLOYMENT: "Trabalho",
    PAYROLL: "Folha",
    WORK_SCHEDULE: "Jornada",
    TIME_RECORD: "Ponto",
    GEOLOCATION: "Geolocalizacao",
    BIOMETRIC: "Biometria",
    DOCUMENT: "Documento",
    MESSAGE: "Mensagem",
    SECURITY_LOG: "Seguranca",
    LEGAL_CONSENT: "Consentimento",
    LGPD_REQUEST: "LGPD",
    COMPANY: "Empresa",
    USER_ACCOUNT: "Conta",
  };

  return categoryLabels[dataCategory] ?? dataCategory;
};

export const getDataProcessingPurposeLabel = (item: DataProcessingPurpose): string => {
  const purpose = item.purpose?.trim();

  if (!purpose) {
    return "Nao informado";
  }

  return purpose;
};

export const getDataProcessingSummary = (catalog: DataProcessingPurpose[]) => {
  const total = catalog.length;
  const active = catalog.filter((item) => item.active).length;
  const sensitive = catalog.filter((item) => item.sensitive).length;

  return { total, active, sensitive };
};

export const getCurrentTermPreview = (term?: CurrentLegalTextResponse | null): string => {
  if (!term) {
    return "Nao informado";
  }

  const content = term.content?.trim() ?? "";
  if (!content) {
    return "Termo sem conteudo";
  }

  return content.length > 160 ? `${content.slice(0, 160).trim()}...` : content;
};

export const getCurrentTermVersionLabel = (term?: CurrentLegalTextResponse | null): string => {
  if (!term) {
    return "Nao informado";
  }

  return `Versao ${term.version}`;
};

export const getCurrentTermHashSummary = (term?: CurrentLegalTextResponse | null): string =>
  shortHashValue(term?.contentHashSha256);

export const buildAddressLine = (street?: string | null, number?: string | null): string => {
  const parts = [street?.trim(), number?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Endereco nao informado";
};

export const buildCityStateLine = (city?: string | null, state?: string | null): string => {
  const cityPart = city?.trim();
  const statePart = state?.trim();

  if (!cityPart && !statePart) {
    return "Localizacao nao informada";
  }

  if (!cityPart) {
    return statePart ?? "Localizacao nao informada";
  }

  if (!statePart) {
    return cityPart;
  }

  return `${cityPart} / ${statePart}`;
};

export const formatMaskedCpf = maskCpfValue;
export const formatProtectedSalary = maskSalaryValue;
export const formatPrettyPhone = formatPhoneValue;
export const formatShortHash = shortHashValue;
export const formatOnlyDigits = onlyDigits;

export const formatConsentHistoryDate = formatDateTimeBR;
export const formatTermDate = formatDateBR;
