import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import PrivacyPolicy from "./PrivacyPolicy";
import * as privacyService from "@/service/public-privacy.service";

vi.mock("@/service/public-privacy.service");

const mockPrivacyPolicy = {
  version: "2026.05.1",
  effectiveDate: "2026-05-27",
  title: "Política de Privacidade",
  sections: [
    {
      title: "Operador de Dados",
      content: "Kronos é operada por KTS Tecnologia",
    },
    {
      title: "Coleta de Dados",
      content: "Coletamos dados necessários para operação",
    },
  ],
};

describe("PrivacyPolicy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state initially", () => {
    vi.mocked(privacyService.getPublicPrivacyPolicy).mockImplementation(
      () => new Promise(() => {})
    );

    const { container } = render(<PrivacyPolicy />);

    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("should render the policy when data loads", async () => {
    vi.mocked(privacyService.getPublicPrivacyPolicy).mockResolvedValue(
      mockPrivacyPolicy
    );

    render(<PrivacyPolicy />);

    await waitFor(() => {
      expect(screen.getByText("Política de Privacidade")).toBeInTheDocument();
    });

    expect(screen.getByText("Operador de Dados")).toBeInTheDocument();
    expect(screen.getByText("Coleta de Dados")).toBeInTheDocument();
  });

  it("should load the policy from the public privacy service", async () => {
    vi.mocked(privacyService.getPublicPrivacyPolicy).mockResolvedValue(
      mockPrivacyPolicy
    );

    render(<PrivacyPolicy />);

    await waitFor(() => {
      expect(privacyService.getPublicPrivacyPolicy).toHaveBeenCalledTimes(1);
    });
  });

  it("should display version and effective date", async () => {
    vi.mocked(privacyService.getPublicPrivacyPolicy).mockResolvedValue(
      mockPrivacyPolicy
    );

    render(<PrivacyPolicy />);

    await waitFor(() => {
      expect(screen.getByText(/Versão 2026\.05\.1/)).toBeInTheDocument();
      expect(screen.getByText(/Vigente desde/)).toBeInTheDocument();
    });
  });

  it("should display error state when data fails to load", async () => {
    const errorMessage = "Erro ao carregar";
    vi.mocked(privacyService.getPublicPrivacyPolicy).mockRejectedValue(
      new Error(errorMessage)
    );

    render(<PrivacyPolicy />);

    await waitFor(() => {
      expect(screen.getByText("Erro ao Carregar")).toBeInTheDocument();
    });
  });

  it("should display all sections", async () => {
    vi.mocked(privacyService.getPublicPrivacyPolicy).mockResolvedValue(
      mockPrivacyPolicy
    );

    render(<PrivacyPolicy />);

    await waitFor(() => {
      expect(screen.getByText("Operador de Dados")).toBeInTheDocument();
      expect(screen.getByText("Coleta de Dados")).toBeInTheDocument();
    });

    expect(screen.getByText("Kronos é operada por KTS Tecnologia")).toBeInTheDocument();
    expect(screen.getByText("Coletamos dados necessários para operação")).toBeInTheDocument();
  });

  it("should display LGPD rights information", async () => {
    vi.mocked(privacyService.getPublicPrivacyPolicy).mockResolvedValue(
      mockPrivacyPolicy
    );

    render(<PrivacyPolicy />);

    await waitFor(() => {
      expect(screen.getByText(/Seus direitos LGPD/)).toBeInTheDocument();
    });
  });

  it("should display contact information for data protection", async () => {
    vi.mocked(privacyService.getPublicPrivacyPolicy).mockResolvedValue(
      mockPrivacyPolicy
    );

    render(<PrivacyPolicy />);

    await waitFor(() => {
      expect(screen.getByText(/encarregado de proteção de dados/)).toBeInTheDocument();
    });
  });
});
