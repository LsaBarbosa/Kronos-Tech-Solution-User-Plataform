import { describe, expect, it } from "vitest";
import { mapUsuarioProfileViewModel } from "./usuario-profile.mapper";
import type {
  BiometricConsentStatus,
  ConsentHistoryResponse,
  CurrentLegalTextResponse,
  DataProcessingPurpose,
} from "@/types/legal";
import type { SessionUserData } from "@/types/user";

const baseSessionProfile: SessionUserData = {
  accountData: {
    userId: "user-1",
    username: "maria.silva",
    role: "PARTNER",
    active: true,
    employeeId: "emp-1",
  },
  profileData: {
    employeeId: "emp-1",
    fullName: "Maria Silva",
    maskedCpf: "12345678901",
    jobPosition: "Analista de RH",
    email: "maria@exemplo.com",
    salary: 4500,
    phone: "11999999999",
    address: {
      street: "Rua A",
      number: "100",
      postalCode: "01001000",
      city: "Sao Paulo",
      state: "SP",
    },
    companyName: "Kronos",
    lastSeenMessageTimestamp: "2026-06-12T12:30:00Z",
    homeOffice: false,
  },
  userData: {
    employeeId: "emp-1",
    fullName: "Maria Silva",
    maskedCpf: "12345678901",
    jobPosition: "Analista de RH",
    email: "maria@exemplo.com",
    salary: 4500,
    phone: "11999999999",
    address: {
      street: "Rua A",
      number: "100",
      postalCode: "01001000",
      city: "Sao Paulo",
      state: "SP",
    },
    companyName: "Kronos",
    lastSeenMessageTimestamp: "2026-06-12T12:30:00Z",
    homeOffice: false,
    role: "PARTNER",
  },
  role: "PARTNER",
};

describe("mapUsuarioProfileViewModel", () => {
  it("mantem mascaramento e consolida dados de LGPD", () => {
    const biometricStatus: BiometricConsentStatus = {
      biometricConsentAccepted: true,
      acceptedVersion: "2026.05.21",
      acceptedHash: "abcdef1234567890",
      currentVersion: "2026.05.21",
      currentHash: "abcdef1234567890",
      requiresNewAcceptance: false,
    };

    const consentHistory: ConsentHistoryResponse[] = [
      {
        consentId: "consent-1",
        type: "BIOMETRIC_AUTHENTICATION",
        legalBasis: "CONSENT",
        version: "2026.05.21",
        purpose: "Autenticacao facial",
        grantedAt: "2026-05-21T10:00:00Z",
        revokedAt: null,
        status: "ATIVO",
        hasEvidenceDocument: true,
        evidenceDocumentId: "doc-123",
        acceptedFrom: "10.0.0.1",
        revokedFrom: null,
      },
    ];

    const currentTerm: CurrentLegalTextResponse = {
      documentType: "BIOMETRIC_CONSENT_TERM",
      version: "2026.05.21",
      title: "Termo Biométrico",
      content: "Conteudo do termo",
      contentHashSha256: "abcdef1234567890",
      active: true,
    };

    const processingCatalog: DataProcessingPurpose[] = [
      {
        code: "CONTACT_EMAIL",
        dataCategory: "CONTACT",
        legalBasis: "CONTRACT_EXECUTION",
        purpose: "Manter contato com o colaborador",
        retentionPolicyCode: "RET-01",
        sensitive: false,
        active: true,
      },
      {
        code: "BIOMETRIC_AUTH",
        dataCategory: "BIOMETRIC",
        legalBasis: "CONSENT",
        purpose: "Autenticacao biometrica",
        retentionPolicyCode: "RET-02",
        sensitive: true,
        active: false,
      },
    ];

    const result = mapUsuarioProfileViewModel(
      baseSessionProfile,
      biometricStatus,
      consentHistory,
      currentTerm,
      processingCatalog
    );

    expect(result.identity?.maskedCpf).toBe("123.***.***-01");
    expect(result.identity?.salaryLabel).toBe("R$ ••••••");
    expect(result.contact?.phoneDisplay).toBe("(11) 99999-9999");
    expect(result.privacy.biometric.label).toBe("Consentimento biometrico ativo");
    expect(result.privacy.currentTerm?.versionLabel).toBe("Versao 2026.05.21");
    expect(result.privacy.consentHistory[0].statusLabel).toBe("Ativo");
    expect(result.privacy.processingCatalog.total).toBe(2);
    expect(result.privacy.processingCatalog.active).toBe(1);
    expect(result.privacy.processingCatalog.sensitive).toBe(1);
    expect(result.privacy.processingCatalog.highlights[0].dataCategoryLabel).toBe("Contato");
    expect(result.privacy.processingCatalog.highlights[0].purposeLabel).toBe("Manter contato com o colaborador");
  });
});
