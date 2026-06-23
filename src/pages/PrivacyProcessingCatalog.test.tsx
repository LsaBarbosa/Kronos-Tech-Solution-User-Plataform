import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PrivacyProcessingCatalog from "./PrivacyProcessingCatalog";
import * as privacyService from "@/service/public-privacy.service";

vi.mock("@/service/public-privacy.service");

const mockProcessingCatalog = {
  version: "2026.05.1",
  effectiveDate: "2026-05-27",
  activities: [
    {
      code: "COMPANY_REGISTRATION",
      title: "Cadastro de Empresa",
      description: "Registro de empresa na plataforma",
      dataCategories: ["Nome", "CNPJ"],
      purposes: ["Identificação"],
      legalBases: ["Consentimento"],
      retentionPolicy: "2 anos",
      dataSubjectRights: ["Acesso", "Exclusão"],
    },
  ],
};

describe("PrivacyProcessingCatalog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state initially", () => {
    vi.mocked(privacyService.getPublicProcessingCatalog).mockImplementation(
      () => new Promise(() => {})
    );

    const { container } = render(<MemoryRouter><PrivacyProcessingCatalog /></MemoryRouter>);

    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("should render the catalog when data loads", async () => {
    vi.mocked(privacyService.getPublicProcessingCatalog).mockResolvedValue(
      mockProcessingCatalog
    );

    render(<MemoryRouter><PrivacyProcessingCatalog /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText("Catálogo de Tratamento de Dados")).toBeInTheDocument();
    });

    expect(screen.getByText("Cadastro de Empresa")).toBeInTheDocument();
    expect(screen.getByText("Registro de empresa na plataforma")).toBeInTheDocument();
  });

  it("should display version and effective date", async () => {
    vi.mocked(privacyService.getPublicProcessingCatalog).mockResolvedValue(
      mockProcessingCatalog
    );

    render(<MemoryRouter><PrivacyProcessingCatalog /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText(/Versão 2026\.05\.1/)).toBeInTheDocument();
      expect(screen.getByText(/Vigente desde/)).toBeInTheDocument();
    });
  });

  it("should display error state when data fails to load", async () => {
    const errorMessage = "Erro ao carregar";
    vi.mocked(privacyService.getPublicProcessingCatalog).mockRejectedValue(
      new Error(errorMessage)
    );

    render(<MemoryRouter><PrivacyProcessingCatalog /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText("Erro ao Carregar")).toBeInTheDocument();
    });
  });

  it("should display activity categories", async () => {
    vi.mocked(privacyService.getPublicProcessingCatalog).mockResolvedValue(
      mockProcessingCatalog
    );

    render(<MemoryRouter><PrivacyProcessingCatalog /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText("Categorias de Dados")).toBeInTheDocument();
      expect(screen.getByText("Nome")).toBeInTheDocument();
      expect(screen.getByText("CNPJ")).toBeInTheDocument();
    });
  });

  it("should display purposes", async () => {
    vi.mocked(privacyService.getPublicProcessingCatalog).mockResolvedValue(
      mockProcessingCatalog
    );

    render(<MemoryRouter><PrivacyProcessingCatalog /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText("Finalidades")).toBeInTheDocument();
      expect(screen.getByText("Identificação")).toBeInTheDocument();
    });
  });

  it("should display legal bases", async () => {
    vi.mocked(privacyService.getPublicProcessingCatalog).mockResolvedValue(
      mockProcessingCatalog
    );

    render(<MemoryRouter><PrivacyProcessingCatalog /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText("Bases Legais")).toBeInTheDocument();
      expect(screen.getByText("Consentimento")).toBeInTheDocument();
    });
  });

  it("should display data subject rights", async () => {
    vi.mocked(privacyService.getPublicProcessingCatalog).mockResolvedValue(
      mockProcessingCatalog
    );

    render(<MemoryRouter><PrivacyProcessingCatalog /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText("Seus Direitos")).toBeInTheDocument();
      expect(screen.getByText("Acesso")).toBeInTheDocument();
      expect(screen.getByText("Exclusão")).toBeInTheDocument();
    });
  });

  it("should display retention policy", async () => {
    vi.mocked(privacyService.getPublicProcessingCatalog).mockResolvedValue(
      mockProcessingCatalog
    );

    render(<MemoryRouter><PrivacyProcessingCatalog /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText("Retenção de Dados")).toBeInTheDocument();
      expect(screen.getByText("2 anos")).toBeInTheDocument();
    });
  });
});
