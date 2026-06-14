import type { BiometricConsentStatus, ConsentHistoryResponse, CurrentLegalTextResponse, DataProcessingPurpose } from "@/types/legal";
import type { SessionUserData, UserAccountData, UserData } from "@/types/user";
import {
  buildAddressLine,
  buildCityStateLine,
  formatDateTimeBR,
  formatMaskedCpf,
  formatPrettyPhone,
  formatProtectedSalary,
  formatShortHash,
  formatConsentHistoryDate,
  getAccountStatusLabel,
  getAccountStatusTone,
  getBiometricConsentLabel,
  getBiometricConsentTone,
  getDataProcessingCategoryLabel,
  getConsentHistoryStatusLabel,
  getConsentHistoryStatusTone,
  getConsentHistoryTypeLabel,
  getCurrentTermHashSummary,
  getCurrentTermPreview,
  getCurrentTermVersionLabel,
  getDataProcessingSummary,
  getDataProcessingPurposeLabel,
  getRoleLabel,
} from "@/features/user-profile/utils/usuario-profile-formatters";
import { getInitialsValue } from "@/features/user-profile/utils/mask-sensitive-data";
import type { UsuarioProfileTone } from "@/features/user-profile/styles/usuario-profile.tokens";

export interface UsuarioIdentitySummary {
  fullName: string;
  initials: string;
  username: string;
  role: string;
  roleLabel: string;
  jobPosition: string;
  companyName: string;
  userId: string;
  maskedCpf: string;
  salaryLabel: string;
  homeOfficeLabel: string;
  accountStatusLabel: string;
  accountStatusTone: UsuarioProfileTone;
  addressLine: string;
  cityStateLine: string;
  postalCode: string;
  lastSeenMessageLabel: string;
}

export interface UsuarioContactSummary {
  email: string;
  phone: string;
  phoneDisplay: string;
}

export interface UsuarioSecuritySummary {
  passwordWarning: string;
  passwordHint: string;
}

export interface UsuarioBiometricSummary {
  status: BiometricConsentStatus | null;
  label: string;
  tone: UsuarioProfileTone;
  acceptedVersionLabel: string;
  acceptedHashSummary: string;
  currentVersionLabel: string;
  currentHashSummary: string;
  requiresNewAcceptanceLabel: string;
}

export interface UsuarioConsentHistorySummary {
  consentId: string;
  title: string;
  type: string;
  typeLabel: string;
  legalBasis: string;
  version: string;
  purpose: string;
  status: string;
  statusLabel: string;
  statusTone: UsuarioProfileTone;
  grantedAtLabel: string;
  revokedAtLabel: string;
  evidenceAvailable: boolean;
  evidenceDocumentId: string;
  acceptedFrom: string;
  revokedFrom: string;
}

export interface UsuarioCurrentTermSummary {
  title: string;
  documentType: string;
  versionLabel: string;
  hashSummary: string;
  activeLabel: string;
  contentPreview: string;
}

export interface UsuarioProcessingCatalogItemSummary {
  code: string;
  purpose: string;
  purposeLabel: string;
  legalBasis: string;
  dataCategory: string;
  dataCategoryLabel: string;
  retentionPolicyCode: string;
  sensitive: boolean;
  active: boolean;
}

export interface UsuarioProcessingCatalogSummary {
  total: number;
  active: number;
  sensitive: number;
  highlights: UsuarioProcessingCatalogItemSummary[];
}

export interface UsuarioPrivacySummary {
  biometric: UsuarioBiometricSummary;
  currentTerm: UsuarioCurrentTermSummary | null;
  consentHistory: UsuarioConsentHistorySummary[];
  processingCatalog: UsuarioProcessingCatalogSummary;
}

export interface UsuarioProfileViewModel {
  accountData: UserAccountData | null;
  profileData: UserData | null;
  sessionProfile: SessionUserData | null;
  identity: UsuarioIdentitySummary | null;
  contact: UsuarioContactSummary | null;
  security: UsuarioSecuritySummary;
  privacy: UsuarioPrivacySummary;
}

const getHomeOfficeLabel = (homeOffice?: boolean | null): string => {
  if (homeOffice === true) {
    return "Remoto";
  }

  if (homeOffice === false) {
    return "Presencial";
  }

  return "Nao informado";
};

const getLastSeenMessageLabel = (value?: string | null): string => {
  if (!value) {
    return "Sem registro recente";
  }

  return `Ultima atividade de mensagens: ${formatDateTimeBR(value)}`;
};

const getBiometricTone = (status: BiometricConsentStatus | null): UsuarioProfileTone => {
  return getBiometricConsentTone(status) === "active" ? "active" : "pending";
};

const mapConsentHistoryItem = (item: ConsentHistoryResponse): UsuarioConsentHistorySummary => ({
  consentId: item.consentId,
  title: getConsentHistoryTypeLabel(item.type),
  type: item.type,
  typeLabel: getConsentHistoryTypeLabel(item.type),
  legalBasis: item.legalBasis,
  version: item.version,
  purpose: item.purpose,
  status: item.status,
  statusLabel: getConsentHistoryStatusLabel(item.status),
  statusTone: getConsentHistoryStatusTone(item.status),
  grantedAtLabel: formatConsentHistoryDate(item.grantedAt),
  revokedAtLabel: item.revokedAt ? formatConsentHistoryDate(item.revokedAt) : "Nao revogado",
  evidenceAvailable: item.hasEvidenceDocument,
  evidenceDocumentId: item.evidenceDocumentId ?? "",
  acceptedFrom: item.acceptedFrom,
  revokedFrom: item.revokedFrom ?? "Nao revogado",
});

const mapCurrentTerm = (term: CurrentLegalTextResponse): UsuarioCurrentTermSummary => ({
  title: term.title,
  documentType: term.documentType,
  versionLabel: getCurrentTermVersionLabel(term),
  hashSummary: getCurrentTermHashSummary(term),
  activeLabel: term.active ? "Versao ativa" : "Versao inativa",
  contentPreview: getCurrentTermPreview(term),
});

const mapProcessingCatalogItem = (item: DataProcessingPurpose): UsuarioProcessingCatalogItemSummary => ({
  code: item.code,
  purpose: item.purpose,
  purposeLabel: getDataProcessingPurposeLabel(item),
  legalBasis: item.legalBasis,
  dataCategory: item.dataCategory,
  dataCategoryLabel: getDataProcessingCategoryLabel(item.dataCategory),
  retentionPolicyCode: item.retentionPolicyCode,
  sensitive: item.sensitive,
  active: item.active,
});

export const mapUsuarioProfileViewModel = (
  sessionProfile: SessionUserData | null,
  biometricStatus: BiometricConsentStatus | null,
  consentHistory: ConsentHistoryResponse[] = [],
  currentBiometricTerm: CurrentLegalTextResponse | null = null,
  processingCatalog: DataProcessingPurpose[] = []
): UsuarioProfileViewModel => {
  const profileData = sessionProfile?.profileData ?? null;
  const accountData = sessionProfile?.accountData ?? null;

  const identity = profileData && accountData
    ? {
        fullName: profileData.fullName ?? "Nao informado",
        initials: getInitialsValue(profileData.fullName),
        username: accountData.username ?? "Nao informado",
        role: sessionProfile.role,
        roleLabel: getRoleLabel(sessionProfile.role),
        jobPosition: profileData.jobPosition ?? "Nao informado",
        companyName: profileData.companyName ?? "Nao informado",
        userId: accountData.userId,
        maskedCpf: formatMaskedCpf(profileData.maskedCpf),
        salaryLabel: formatProtectedSalary(profileData.salary),
        homeOfficeLabel: getHomeOfficeLabel(profileData.homeOffice),
        accountStatusLabel: getAccountStatusLabel(accountData.active),
        accountStatusTone: getAccountStatusTone(accountData.active),
        addressLine: buildAddressLine(profileData.address?.street, profileData.address?.number),
        cityStateLine: buildCityStateLine(profileData.address?.city, profileData.address?.state),
        postalCode: profileData.address?.postalCode ?? "Nao informado",
        lastSeenMessageLabel: getLastSeenMessageLabel(profileData.lastSeenMessageTimestamp),
      }
    : null;

  const contact = profileData
    ? {
        email: profileData.email ?? "",
        phone: profileData.phone ?? "",
        phoneDisplay: formatPrettyPhone(profileData.phone),
      }
    : null;

  const privacy: UsuarioPrivacySummary = {
    biometric: {
      status: biometricStatus,
      label: getBiometricConsentLabel(biometricStatus),
      tone: getBiometricTone(biometricStatus),
      acceptedVersionLabel: biometricStatus?.acceptedVersion
        ? `Aceito na versao ${biometricStatus.acceptedVersion}`
        : "Nenhum aceite registrado",
      acceptedHashSummary: formatShortHash(biometricStatus?.acceptedHash),
      currentVersionLabel: biometricStatus?.currentVersion
        ? `Versao atual ${biometricStatus.currentVersion}`
        : "Versao atual nao informada",
      currentHashSummary: formatShortHash(biometricStatus?.currentHash),
      requiresNewAcceptanceLabel: biometricStatus?.requiresNewAcceptance
        ? "Nova aceitacao necessaria"
        : "Sem nova aceitacao",
    },
    currentTerm: currentBiometricTerm ? mapCurrentTerm(currentBiometricTerm) : null,
    consentHistory: consentHistory.map(mapConsentHistoryItem),
    processingCatalog: {
      ...getDataProcessingSummary(processingCatalog),
      highlights: processingCatalog.slice(0, 4).map(mapProcessingCatalogItem),
    },
  };

  return {
    accountData,
    profileData,
    sessionProfile,
    identity,
    contact,
    security: {
      passwordWarning: "A alteracao de senha encerra a sessao atual.",
      passwordHint: "Use uma senha forte com no minimo 8 caracteres.",
    },
    privacy,
  };
};
