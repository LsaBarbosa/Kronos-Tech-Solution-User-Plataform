import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { APP_PATHS, APP_ROUTE_META } from "@/config/app-routes";
import { AdminLgpdRequestDetails } from "./AdminLgpdRequestDetails";
import type {
  LgpdRequestDetailsResponse,
  LgpdRequestStatus,
  LgpdRequestType,
} from "@/service/lgpd.service";

const getAdminRequestDetailsMock = vi.hoisted(() => vi.fn());
const getAnonymizationResultMock = vi.hoisted(() => vi.fn());
const transitionRequestStatusMock = vi.hoisted(() => vi.fn());
const exportApprovedLgpdRequestDataMock = vi.hoisted(() => vi.fn());
const useAuthMock = vi.hoisted(() => vi.fn());
const toastSuccessMock = vi.hoisted(() => vi.fn());
const toastErrorMock = vi.hoisted(() => vi.fn());

vi.mock("@/context/AuthContext", () => ({
  useAuth: useAuthMock,
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: {
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}));

vi.mock("@/components/PageShell", () => ({
  default: ({ children }: { children: ReactNode }) => (
    <div>
      <header>Mock Header</header>
      {children}
    </div>
  ),
}));

vi.mock("@/components/privacy/AdminAnonymizationWorkflow", () => ({
  AdminAnonymizationWorkflow: () => <div data-testid="anonymization-workflow" />,
}));

vi.mock("@/service/lgpd.service", async () => {
  const actual = await vi.importActual<typeof import("@/service/lgpd.service")>(
    "@/service/lgpd.service"
  );

  return {
    ...actual,
    getAdminRequestDetails: getAdminRequestDetailsMock,
    getAnonymizationResult: getAnonymizationResultMock,
    transitionRequestStatus: transitionRequestStatusMock,
    exportApprovedLgpdRequestData: exportApprovedLgpdRequestDataMock,
  };
});

const requestId = "2a56db47-3817-44e7-9f92-f25aa8b745fa";
const ownCompanyId = "5f6d9c0e-b90f-4d35-bdf4-2f2b21e9ad58";

const buildDetails = (
  status: LgpdRequestStatus,
  type: LgpdRequestType = "ACCESS",
  companyId = ownCompanyId
): LgpdRequestDetailsResponse => ({
  request: {
    requestId,
    employeeId: "8f9c70d0-e519-4123-8e8b-43f3d047508f",
    requestedByUserId: "9b95c5be-16e7-4c94-8df7-26d8ba1f0d19",
    companyId,
    requestType: type,
    status,
    description: "Exportar meus dados pessoais",
    resolutionNotes: null,
    createdAt: "2026-06-01T18:20:35.123Z",
    updatedAt: "2026-06-01T18:20:35.123Z",
    resolvedAt: null,
    resolvedByUserId: null,
  },
  employee: {
    employeeId: "8f9c70d0-e519-4123-8e8b-43f3d047508f",
    fullName: "Maria Souza",
    email: "maria@example.com",
    jobPosition: "Atendente",
  },
  company: {
    companyId,
    cnpj: "41609608000103",
    tradeName: "Padaria Exemplo LTDA",
  },
  assignedTo: null,
  history: [],
});

const renderDetails = (details: LgpdRequestDetailsResponse) => {
  getAdminRequestDetailsMock.mockResolvedValue(details);

  return render(
    <MemoryRouter initialEntries={[`/lgpd/admin/requests/${requestId}`]}>
      <Routes>
        <Route path={APP_PATHS.lgpdAdminRequestDetails} element={<AdminLgpdRequestDetails />} />
      </Routes>
    </MemoryRouter>
  );
};

describe("AdminLgpdRequestDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAnonymizationResultMock.mockResolvedValue(null);
    transitionRequestStatusMock.mockResolvedValue({});
    exportApprovedLgpdRequestDataMock.mockResolvedValue({});
    useAuthMock.mockReturnValue({
      status: "authenticated",
      user: null,
      role: "MANAGER",
      isAuthenticated: true,
      biometricConsent: null,
      checkSession: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      refreshBiometricConsent: vi.fn(),
    });
  });

  it("shows only the start-analysis action for an OPEN request", async () => {
    renderDetails(buildDetails("OPEN"));

    expect(await screen.findByRole("button", { name: /Iniciar análise/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Aprovar exportação/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Exportar dados revisados/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Concluir solicitação/i })).not.toBeInTheDocument();
  });

  it("renders the PageShell header", async () => {
    renderDetails(buildDetails("OPEN"));

    expect(await screen.findByText("Mock Header")).toBeInTheDocument();
    expect(screen.queryByText("Mock Sidebar")).not.toBeInTheDocument();
  });

  it("shows controller-review action for an IN_ANALYSIS request", async () => {
    renderDetails(buildDetails("IN_ANALYSIS"));

    expect(
      await screen.findByRole("button", { name: /Enviar para revisão do controlador/i })
    ).toBeInTheDocument();
  });

  it("shows legal-review action for a WAITING_CONTROLLER request", async () => {
    renderDetails(buildDetails("WAITING_CONTROLLER"));

    expect(
      await screen.findByRole("button", { name: /Enviar para revisão legal/i })
    ).toBeInTheDocument();
  });

  it("shows export-approval action for an exportable WAITING_LEGAL_REVIEW request", async () => {
    renderDetails(buildDetails("WAITING_LEGAL_REVIEW", "ACCESS"));

    expect(await screen.findByRole("button", { name: /Aprovar exportação/i })).toBeInTheDocument();
  });

  it("opens the approval dialog without duplicating the export-approval action", async () => {
    const user = userEvent.setup();
    renderDetails(buildDetails("WAITING_LEGAL_REVIEW", "ACCESS"));

    const approvalButton = await screen.findByRole("button", { name: /Aprovar exportação/i });

    expect(
      screen.getAllByRole("button", { name: /Aprovar exportação/i })
    ).toHaveLength(1);

    await user.click(approvalButton);

    expect(screen.getByRole("button", { name: /Confirmar aprovação/i })).toBeInTheDocument();
    // Radix Dialog hides the trigger from the accessibility tree while open.
    expect(
      screen.queryAllByRole("button", { name: /Aprovar exportação/i, hidden: true }).length
    ).toBeGreaterThan(0);
  });

  it("shows export and completion actions for an APPROVED_FOR_EXPORT request", async () => {
    renderDetails(buildDetails("APPROVED_FOR_EXPORT", "ACCESS"));

    expect(
      await screen.findByRole("button", { name: /Exportar dados revisados/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Concluir solicitação/i })).toBeInTheDocument();
  });

  it("does not show approval actions for a COMPLETED request", async () => {
    renderDetails(buildDetails("COMPLETED", "ACCESS"));

    await screen.findByText("Detalhes da Solicitação");

    expect(screen.queryByRole("button", { name: /Iniciar análise/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Aprovar exportação/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Exportar dados revisados/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Concluir solicitação/i })).not.toBeInTheDocument();
  });

  it("allows a MANAGER to approve a request returned by the authorized tenant endpoint", async () => {
    const user = userEvent.setup();
    renderDetails(buildDetails("WAITING_LEGAL_REVIEW", "ACCESS", ownCompanyId));

    await user.click(await screen.findByRole("button", { name: /Aprovar exportação/i }));

    const fields = screen.getAllByRole("textbox");
    await user.type(fields[0], "Identidade validada pelo administrador.");
    await user.type(fields[1], "Dados cadastrais e registros de jornada.");

    await user.click(screen.getByRole("button", { name: /Confirmar aprovação/i }));

    await waitFor(() => {
      expect(transitionRequestStatusMock).toHaveBeenCalledWith(
        requestId,
        expect.objectContaining({
          newStatus: "APPROVED_FOR_EXPORT",
        })
      );
    });
  });

  it("shows the approval justification field error when trying to approve without required fields", async () => {
    const user = userEvent.setup();
    renderDetails(buildDetails("WAITING_LEGAL_REVIEW", "ACCESS"));

    await user.click(await screen.findByRole("button", { name: /Aprovar exportação/i }));
    await user.click(screen.getByRole("button", { name: /Confirmar aprovação/i }));

    expect(await screen.findByText("Informe a justificativa da aprovação.")).toBeInTheDocument();
    expect(screen.getByText("Informe o escopo aprovado.")).toBeInTheDocument();
    expect(toastErrorMock).toHaveBeenCalledWith(
      "Preencha os campos obrigatórios antes de continuar."
    );
  });

  it("shows field errors when exporting without required fields", async () => {
    const user = userEvent.setup();
    renderDetails(buildDetails("APPROVED_FOR_EXPORT", "ACCESS"));

    await user.click(await screen.findByRole("button", { name: /Exportar dados revisados/i }));
    await user.click(screen.getByRole("button", { name: "Exportar Dados" }));

    expect(await screen.findByText("Informe o fundamento legal.")).toBeInTheDocument();
    expect(screen.getByText("Informe o motivo operacional.")).toBeInTheDocument();
    expect(screen.getByText("Informe as notas do revisor.")).toBeInTheDocument();
    expect(toastErrorMock).toHaveBeenCalledWith(
      "Revise os campos obrigatórios da exportação."
    );
  });

  it("shows field errors when rejecting without a reason and public note", async () => {
    const user = userEvent.setup();
    renderDetails(buildDetails("OPEN"));

    await user.click(await screen.findByRole("button", { name: /Rejeitar solicitação/i }));
    await user.click(screen.getByRole("button", { name: /Confirmar rejeição/i }));

    expect(await screen.findByText("Informe o motivo da rejeição.")).toBeInTheDocument();
    expect(screen.getByText("Informe a nota pública de rejeição.")).toBeInTheDocument();
  });

  it("shows the cancel reason field error when cancelling without a reason", async () => {
    const user = userEvent.setup();
    useAuthMock.mockReturnValue({
      status: "authenticated",
      user: null,
      role: "CTO",
      isAuthenticated: true,
      biometricConsent: null,
      checkSession: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      refreshBiometricConsent: vi.fn(),
    });

    renderDetails(buildDetails("OPEN"));

    await user.click(await screen.findByRole("button", { name: /Cancelar solicitação/i }));
    await user.click(screen.getByRole("button", { name: /Confirmar Cancelamento/i }));

    expect(await screen.findByText("Informe o motivo do cancelamento.")).toBeInTheDocument();
  });

  it("does not use native alert for required-field validation", async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => undefined);

    renderDetails(buildDetails("WAITING_LEGAL_REVIEW", "ACCESS"));

    await user.click(await screen.findByRole("button", { name: /Aprovar exportação/i }));
    await user.click(screen.getByRole("button", { name: /Confirmar aprovação/i }));

    expect(alertSpy).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  it("does not allow PARTNER in the administrative details route metadata", () => {
    expect(APP_ROUTE_META.lgpdAdminRequestDetails.allowedRoles).toEqual(["CTO", "MANAGER"]);
    expect(APP_ROUTE_META.lgpdAdminRequestDetails.allowedRoles).not.toContain("PARTNER");
  });
});
