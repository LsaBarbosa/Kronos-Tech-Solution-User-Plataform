import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { APP_PATHS } from "@/config/app-routes";
import PrivacyPolicy from "./PrivacyPolicy";
import * as privacyService from "@/service/public-privacy.service";

vi.mock("@/service/public-privacy.service");

const authContextMock = vi.hoisted(() => ({
  status: "unauthenticated" as "checking" | "authenticated" | "unauthenticated",
  checkSession: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    status: authContextMock.status,
    user: authContextMock.status === "authenticated" ? { role: "PARTNER" } : null,
    role: authContextMock.status === "authenticated" ? "PARTNER" : "",
    isAuthenticated: authContextMock.status === "authenticated",
    biometricConsent: null,
    checkSession: authContextMock.checkSession,
    login: vi.fn(),
    logout: vi.fn(),
    refreshBiometricConsent: vi.fn(),
  }),
}));

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

const LocationProbe = () => {
  const location = useLocation();

  return <div data-testid="location-probe">{location.pathname}</div>;
};

const renderPrivacyPolicy = () =>
  render(
    <MemoryRouter initialEntries={[APP_PATHS.privacyPolicy]}>
      <Routes>
        <Route path={APP_PATHS.privacyPolicy} element={<PrivacyPolicy />} />
        <Route path={APP_PATHS.privacidade} element={<LocationProbe />} />
        <Route path={APP_PATHS.dashboard} element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );

describe("PrivacyPolicy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authContextMock.status = "unauthenticated";
    authContextMock.checkSession.mockResolvedValue(undefined);
  });

  it("should render loading state initially", () => {
    vi.mocked(privacyService.getPublicPrivacyPolicy).mockImplementation(
      () => new Promise(() => {})
    );

    const { container } = renderPrivacyPolicy();

    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("should render the policy when data loads", async () => {
    vi.mocked(privacyService.getPublicPrivacyPolicy).mockResolvedValue(
      mockPrivacyPolicy
    );

    renderPrivacyPolicy();

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

    renderPrivacyPolicy();

    await waitFor(() => {
      expect(privacyService.getPublicPrivacyPolicy).toHaveBeenCalledTimes(1);
    });
  });

  it("should display version and effective date", async () => {
    vi.mocked(privacyService.getPublicPrivacyPolicy).mockResolvedValue(
      mockPrivacyPolicy
    );

    renderPrivacyPolicy();

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

    renderPrivacyPolicy();

    await waitFor(() => {
      expect(screen.getByText("Erro ao Carregar")).toBeInTheDocument();
    });
  });

  it("should display all sections", async () => {
    vi.mocked(privacyService.getPublicPrivacyPolicy).mockResolvedValue(
      mockPrivacyPolicy
    );

    renderPrivacyPolicy();

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

    renderPrivacyPolicy();

    await waitFor(() => {
      expect(screen.getByText(/Seus direitos LGPD/)).toBeInTheDocument();
    });
  });

  it("should display contact information for data protection", async () => {
    vi.mocked(privacyService.getPublicPrivacyPolicy).mockResolvedValue(
      mockPrivacyPolicy
    );

    renderPrivacyPolicy();

    await waitFor(() => {
      expect(screen.getByText(/encarregado de proteção de dados/)).toBeInTheDocument();
    });
  });

  it("should not display internal navigation actions for unauthenticated users", async () => {
    vi.mocked(privacyService.getPublicPrivacyPolicy).mockResolvedValue(
      mockPrivacyPolicy
    );

    renderPrivacyPolicy();

    await screen.findByText("Operador de Dados");

    expect(screen.queryByRole("button", { name: /Voltar para Privacidade e Dados/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Ir para o Dashboard/i })).not.toBeInTheDocument();
  });

  it("should display internal navigation actions for authenticated users", async () => {
    authContextMock.status = "authenticated";
    vi.mocked(privacyService.getPublicPrivacyPolicy).mockResolvedValue(
      mockPrivacyPolicy
    );

    renderPrivacyPolicy();

    await screen.findByText("Operador de Dados");

    expect(screen.getByRole("button", { name: /Voltar para Privacidade e Dados/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ir para o Dashboard/i })).toBeInTheDocument();
  });

  it("should navigate to the privacy center when the back action is clicked", async () => {
    authContextMock.status = "authenticated";
    vi.mocked(privacyService.getPublicPrivacyPolicy).mockResolvedValue(
      mockPrivacyPolicy
    );
    const user = userEvent.setup();

    renderPrivacyPolicy();

    await user.click(await screen.findByRole("button", { name: /Voltar para Privacidade e Dados/i }));

    expect(screen.getByTestId("location-probe")).toHaveTextContent(APP_PATHS.privacidade);
  });

  it("should navigate to the dashboard when the dashboard action is clicked", async () => {
    authContextMock.status = "authenticated";
    vi.mocked(privacyService.getPublicPrivacyPolicy).mockResolvedValue(
      mockPrivacyPolicy
    );
    const user = userEvent.setup();

    renderPrivacyPolicy();

    await user.click(await screen.findByRole("button", { name: /Ir para o Dashboard/i }));

    expect(screen.getByTestId("location-probe")).toHaveTextContent(APP_PATHS.dashboard);
  });

  it("should keep displaying the policy without internal actions while authentication is checking", async () => {
    authContextMock.status = "checking";
    vi.mocked(privacyService.getPublicPrivacyPolicy).mockResolvedValue(
      mockPrivacyPolicy
    );

    renderPrivacyPolicy();

    await screen.findByText("Operador de Dados");

    expect(authContextMock.checkSession).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: /Voltar para Privacidade e Dados/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Ir para o Dashboard/i })).not.toBeInTheDocument();
  });
});
