import { describe, expect, it } from "vitest";
import {
  getDataProcessingCategoryLabel,
  getDataProcessingPurposeLabel,
  getAccountStatusLabel,
  getBiometricConsentLabel,
  getConsentHistoryStatusLabel,
} from "./usuario-profile-formatters";
import type { DataProcessingPurpose, BiometricConsentStatus } from "@/types/legal";

describe("usuario-profile-formatters", () => {
  it("resolve labels de categoria e finalidade do catalogo", () => {
    const item = {
      code: "EMP_EMAIL",
      dataCategory: "CONTACT",
      legalBasis: "CONTRACT_EXECUTION",
      purpose: "Manter contato com o colaborador",
      retentionPolicyCode: "RET-12",
      sensitive: false,
      active: true,
    } satisfies DataProcessingPurpose;

    expect(getDataProcessingCategoryLabel(item.dataCategory)).toBe("Contato");
    expect(getDataProcessingPurposeLabel(item)).toBe("Manter contato com o colaborador");
  });

  it("resolve labels de status da conta", () => {
    expect(getAccountStatusLabel(true)).toBe("Conta ativa");
    expect(getAccountStatusLabel(false)).toBe("Conta inativa");
  });

  it("resolve labels de consentimento biometrico", () => {
    const status = {
      biometricConsentAccepted: true,
      acceptedVersion: "2026.05.21",
      acceptedHash: "hash",
      currentVersion: "2026.05.21",
      currentHash: "hash",
      requiresNewAcceptance: false,
    } satisfies BiometricConsentStatus;

    expect(getBiometricConsentLabel(status)).toBe("Consentimento biometrico ativo");
    expect(getBiometricConsentLabel(null)).toBe("Consentimento nao carregado");
  });

  it("resolve labels de historico de consentimento", () => {
    expect(getConsentHistoryStatusLabel("ATIVO")).toBe("Ativo");
    expect(getConsentHistoryStatusLabel("REVOGADO")).toBe("Revogado");
  });
});
