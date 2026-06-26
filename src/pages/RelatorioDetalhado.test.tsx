import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RelatorioDetalhado from "./RelatorioDetalhado";
import { useAuth } from "@/context/AuthContext";
import { useCheckin } from "@/hooks/useCheckin";

vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/hooks/useCheckin", () => ({
  useCheckin: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock("@/service/records.service", () => ({
  fetchDetailedReport: vi.fn().mockResolvedValue([]),
  fetchManagerOptions: vi.fn().mockResolvedValue([]),
  fetchReportEmployees: vi.fn().mockResolvedValue([]),
  updateTimeRecord: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/service/csrf.service", () => ({
  preloadCsrfToken: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/features/detailed-report-export", () => ({
  downloadDetailedReportPdf: vi.fn(),
  downloadDetailedReportCsv: vi.fn(),
}));

vi.mock("@/components/faq/FaqSearchTrigger", () => ({
  FaqSearchTrigger: () => null,
}));

vi.mock("@/components/faq/FaqContextualBlock", () => ({
  FaqContextualBlock: () => null,
}));

const mockUseAuth = vi.mocked(useAuth);
const mockUseCheckin = vi.mocked(useCheckin);

describe("/relatorio-detalhado", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAuth.mockReturnValue({
      status: "authenticated",
      user: {
        account: {
          userId: "user-1",
          username: "maria.silva",
          role: "MANAGER",
          active: true,
          employeeId: "employee-1",
        },
        profile: {
          employeeId: "employee-1",
          fullName: "Maria Silva",
          email: "maria@kronos.test",
          phone: "11999990000",
          role: "MANAGER",
          companyName: "Kronos",
          lastSeenMessageTimestamp: "2026-06-14T10:00:00Z",
        },
        role: "MANAGER",
      },
      role: "MANAGER",
      isAuthenticated: true,
      biometricConsent: null,
      checkSession: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      refreshBiometricConsent: vi.fn(),
    });

    mockUseCheckin.mockReturnValue({
      isOpen: false,
      openCheckin: vi.fn(),
      closeCheckin: vi.fn(),
      submitCheckin: vi.fn(),
      isSubmitting: false,
      lastCheckin: null,
      pendingAction: null,
      loading: false,
      error: null,
      refreshCheckin: vi.fn(),
    } as never);
  });

  it("renderiza a experiência desktop sem quebrar a árvore principal", async () => {
    render(
      <MemoryRouter initialEntries={["/relatorio-detalhado"]}>
        <RelatorioDetalhado />
      </MemoryRouter>
    );

    expect(
      await screen.findByText("Solicitação inteligente de relatório de ponto")
    ).toBeInTheDocument();
    expect(screen.getByText("Relatório detalhado")).toBeInTheDocument();
    expect(screen.getByText("Governança e escopo")).toBeInTheDocument();
  });
});
