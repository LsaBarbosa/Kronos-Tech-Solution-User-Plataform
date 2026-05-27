import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import PrivacyBiometricTerm from "./PrivacyBiometricTerm";
import * as privacyService from "@/service/public-privacy.service";

vi.mock("@/service/public-privacy.service");

const mockBiometricTerm = {
  version: "2026.05.1",
  effectiveDate: "2026-05-27",
  title: "Termo de Biometria Facial",
  sections: [
    {
      title: "O que é biometria",
      content: "Biometria facial é a captura de características faciais",
    },
    {
      title: "Consentimento",
      content: "O uso de biometria requer seu consentimento explícito",
    },
  ],
};

describe("PrivacyBiometricTerm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state initially", () => {
    vi.mocked(privacyService.getPublicBiometricTerm).mockImplementation(
      () => new Promise(() => {})
    );

    const { container } = render(<PrivacyBiometricTerm />);

    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("should render the term when data loads", async () => {
    vi.mocked(privacyService.getPublicBiometricTerm).mockResolvedValue(
      mockBiometricTerm
    );

    render(<PrivacyBiometricTerm />);

    await waitFor(() => {
      expect(screen.getByText("Termo de Biometria Facial")).toBeInTheDocument();
    });

    expect(screen.getByText("O que é biometria")).toBeInTheDocument();
    expect(screen.getByText("Consentimento")).toBeInTheDocument();
  });

  it("should display version and effective date", async () => {
    vi.mocked(privacyService.getPublicBiometricTerm).mockResolvedValue(
      mockBiometricTerm
    );

    render(<PrivacyBiometricTerm />);

    await waitFor(() => {
      expect(screen.getByText(/Versão 2026\.05\.1/)).toBeInTheDocument();
      expect(screen.getByText(/Vigente desde/)).toBeInTheDocument();
    });
  });

  it("should display error state when data fails to load", async () => {
    const errorMessage = "Erro ao carregar";
    vi.mocked(privacyService.getPublicBiometricTerm).mockRejectedValue(
      new Error(errorMessage)
    );

    render(<PrivacyBiometricTerm />);

    await waitFor(() => {
      expect(screen.getByText("Erro ao Carregar")).toBeInTheDocument();
    });
  });

  it("should display all sections", async () => {
    vi.mocked(privacyService.getPublicBiometricTerm).mockResolvedValue(
      mockBiometricTerm
    );

    render(<PrivacyBiometricTerm />);

    await waitFor(() => {
      expect(screen.getByText("O que é biometria")).toBeInTheDocument();
      expect(screen.getByText("Consentimento")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Biometria facial é a captura de características faciais")
    ).toBeInTheDocument();
    expect(
      screen.getByText("O uso de biometria requer seu consentimento explícito")
    ).toBeInTheDocument();
  });

  it("should display important information about biometry optionality", async () => {
    vi.mocked(privacyService.getPublicBiometricTerm).mockResolvedValue(
      mockBiometricTerm
    );

    render(<PrivacyBiometricTerm />);

    await waitFor(() => {
      expect(screen.getByText(/Informações Importantes/)).toBeInTheDocument();
    });

    expect(screen.getByText(/opcional/)).toBeInTheDocument();
  });

  it("should display information about consent revocation", async () => {
    const termWithRevocationInfo = {
      ...mockBiometricTerm,
      sections: [
        ...mockBiometricTerm.sections,
        {
          title: "Revogação",
          content: "Você pode revogar seu consentimento a qualquer momento",
        },
      ],
    };
    vi.mocked(privacyService.getPublicBiometricTerm).mockResolvedValue(
      termWithRevocationInfo
    );

    render(<PrivacyBiometricTerm />);

    await waitFor(() => {
      expect(screen.getByText("Revogação")).toBeInTheDocument();
    });
  });

  it("should display information about LGPD rights", async () => {
    vi.mocked(privacyService.getPublicBiometricTerm).mockResolvedValue(
      mockBiometricTerm
    );

    render(<PrivacyBiometricTerm />);

    await waitFor(() => {
      expect(screen.getByText(/direito LGPD/i)).toBeInTheDocument();
    });
  });

  it("should display contact information", async () => {
    vi.mocked(privacyService.getPublicBiometricTerm).mockResolvedValue(
      mockBiometricTerm
    );

    render(<PrivacyBiometricTerm />);

    await waitFor(() => {
      expect(screen.getByText(/encarregado de proteção de dados/)).toBeInTheDocument();
    });
  });
});
