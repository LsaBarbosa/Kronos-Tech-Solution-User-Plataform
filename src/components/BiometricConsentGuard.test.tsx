import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BiometricConsentGuard } from "./BiometricConsentGuard";

const termsMocks = vi.hoisted(() => ({
  acceptBiometricTerms: vi.fn(),
  checkTermsStatus: vi.fn(),
  getCurrentBiometricTerm: vi.fn(),
}));

vi.mock("@/service/terms.service", () => ({
  acceptBiometricTerms: termsMocks.acceptBiometricTerms,
  checkTermsStatus: termsMocks.checkTermsStatus,
  getCurrentBiometricTerm: termsMocks.getCurrentBiometricTerm,
}));

const renderGuard = () =>
  render(
    <MemoryRouter>
      <BiometricConsentGuard>
        <div>Check-in liberado</div>
      </BiometricConsentGuard>
    </MemoryRouter>
  );

describe("BiometricConsentGuard", () => {
  beforeEach(() => {
    termsMocks.acceptBiometricTerms.mockReset();
    termsMocks.checkTermsStatus.mockReset();
    termsMocks.getCurrentBiometricTerm.mockReset();
    termsMocks.acceptBiometricTerms.mockResolvedValue(undefined);
    termsMocks.getCurrentBiometricTerm.mockResolvedValue({
      type: "BIOMETRIC_CONSENT_TERM",
      version: "2026.05.21",
      title: "Termo de Consentimento Biométrico",
      content: "Conteúdo curto do termo biométrico.",
      contentHashSha256: "current-hash",
      active: true,
    });
  });

  it("permite aceitar quando o termo já cabe inteiro no modal", async () => {
    termsMocks.checkTermsStatus.mockResolvedValue({
      biometricConsentAccepted: false,
      acceptedVersion: null,
      acceptedHash: null,
      currentVersion: "2026.05.21",
      currentHash: "current-hash",
      requiresNewAcceptance: true,
    });

    renderGuard();

    await screen.findByText("Termo de Consentimento Biométrico");

    const viewport = document.querySelector("[data-radix-scroll-area-viewport]");
    expect(viewport).toBeInstanceOf(HTMLElement);

    Object.defineProperty(viewport, "scrollTop", {
      configurable: true,
      value: 0,
    });
    Object.defineProperty(viewport, "clientHeight", {
      configurable: true,
      value: 320,
    });
    Object.defineProperty(viewport, "scrollHeight", {
      configurable: true,
      value: 320,
    });

    fireEvent.scroll(viewport as HTMLElement);

    await userEvent.click(
      screen.getByRole("checkbox", {
        name: /Confirmo que li e aceito o termo de consentimento biométrico/i,
      })
    );

    const acceptButton = screen.getByRole("button", { name: /Confirmar aceite/i });

    await waitFor(() => {
      expect(acceptButton).toBeEnabled();
    });

    await userEvent.click(acceptButton);

    await waitFor(() => {
      expect(termsMocks.acceptBiometricTerms).toHaveBeenCalledWith({
        version: "2026.05.21",
        contentHashSha256: "current-hash",
      });
    });

    expect(await screen.findByText("Check-in liberado")).toBeInTheDocument();
  });
});
