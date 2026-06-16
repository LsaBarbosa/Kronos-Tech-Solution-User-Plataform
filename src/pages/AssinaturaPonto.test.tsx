import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import AssinaturaPonto from "./AssinaturaPonto";
import type { PreviousMonthSignatureStatus } from "@/types/timesheet-signature";

const toastMock = vi.fn();

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));

vi.mock("@/components/PageShell", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="page-shell">{children}</div>,
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    status: "authenticated",
    user: { account: {}, profile: {}, role: "PARTNER" },
    role: "PARTNER",
    isAuthenticated: true,
    biometricConsent: null,
    checkSession: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    refreshBiometricConsent: vi.fn(),
  }),
}));

const serviceMock = vi.hoisted(() => ({
  getPreviousMonthStatus: vi.fn(),
  fetchPreviousMonthPreviewPdf: vi.fn(),
  sign: vi.fn(),
  downloadSignedDocument: vi.fn(),
}));

vi.mock("@/service/timesheetSignature.service", () => ({
  TimesheetSignatureService: serviceMock,
}));

const baseStatus = (overrides: Partial<PreviousMonthSignatureStatus> = {}): PreviousMonthSignatureStatus => ({
  referenceYear: 2026,
  referenceMonth: 5,
  periodStart: "2026-05-01",
  periodEnd: "2026-05-31",
  status: "ELIGIBLE",
  eligible: true,
  alreadySigned: false,
  signatureId: null,
  signedAt: null,
  pointMirrorHashSha256: null,
  recordsSnapshotHashSha256: "records-hash-stub",
  declarationVersion: "1.0",
  declarationText: "Declaro que conferi o espelho de ponto.",
  declarationHashSha256: "abc123",
  blockers: [],
  ...overrides,
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <AssinaturaPonto />
    </MemoryRouter>
  );

describe("AssinaturaPonto", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renderiza o status elegível com mês de referência", async () => {
    serviceMock.getPreviousMonthStatus.mockResolvedValueOnce(baseStatus());

    renderPage();

    expect(await screen.findByText(/Assinatura do Ponto/i)).toBeInTheDocument();
    expect(await screen.findByText(/Pronto para assinar/i)).toBeInTheDocument();
    expect(screen.getByText(/Confirme a declaração/i)).toBeInTheDocument();
  });

  it("lista bloqueios e não exibe o formulário quando status está BLOCKED", async () => {
    serviceMock.getPreviousMonthStatus.mockResolvedValueOnce(
      baseStatus({
        status: "BLOCKED",
        eligible: false,
        blockers: ["Ajuste de ponto pendente em 2026-05-10"],
      })
    );

    renderPage();

    expect(await screen.findByText(/Bloqueado/i)).toBeInTheDocument();
    expect(screen.getByText(/Ajuste de ponto pendente/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Assinar ponto/i })).not.toBeInTheDocument();
  });

  it("não submete sem checkbox marcado e sem senha", async () => {
    serviceMock.getPreviousMonthStatus.mockResolvedValueOnce(baseStatus());

    renderPage();

    const button = await screen.findByRole("button", { name: /Assinar ponto/i });
    expect(button).toBeDisabled();
  });

  it("submete e limpa a senha após a tentativa", async () => {
    serviceMock.getPreviousMonthStatus.mockResolvedValueOnce(baseStatus());
    serviceMock.fetchPreviousMonthPreviewPdf.mockResolvedValueOnce({
      blob: new Blob([new Uint8Array([1, 2, 3])], { type: "application/pdf" }),
    });
    serviceMock.sign.mockResolvedValueOnce({
      signatureId: "sig-1",
      referenceYear: 2026,
      referenceMonth: 5,
      signedAt: "2026-06-01T12:00:00Z",
      signatureType: "INTERNAL_ADVANCED",
      signatureMethod: "PASSWORD_REAUTH",
      pointMirrorHashSha256: "hash-do-pdf",
      recordsSnapshotHashSha256: "hash-records",
      pointMirrorDocumentId: null,
      declarationVersion: "1.0",
    });
    serviceMock.getPreviousMonthStatus.mockResolvedValue(
      baseStatus({
        status: "ALREADY_SIGNED",
        alreadySigned: true,
        signatureId: "sig-1",
        signedAt: "2026-06-01T12:00:00Z",
        pointMirrorHashSha256: "hash-do-pdf",
        recordsSnapshotHashSha256: "hash-records",
        eligible: false,
      })
    );

    const user = userEvent.setup();
    const openSpy = vi.spyOn(window, "open").mockReturnValue(null);

    renderPage();

    const previewButton = await screen.findByRole("button", { name: /Abrir espelho/i });
    await user.click(previewButton);

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    const password = screen.getByPlaceholderText(/Senha de acesso/i);
    await user.type(password, "minha-senha-secreta");

    const submit = screen.getByRole("button", { name: /Assinar ponto/i });
    await waitFor(() => expect(submit).not.toBeDisabled());

    await user.click(submit);

    await waitFor(() => expect(serviceMock.sign).toHaveBeenCalledTimes(1));
    // Após sucesso, status muda para ALREADY_SIGNED e o formulário inteiro (incluindo o input
    // de senha) é desmontado — a senha não permanece no DOM/state da página.
    await waitFor(() =>
      expect(screen.queryByPlaceholderText(/Senha de acesso/i)).not.toBeInTheDocument()
    );
    openSpy.mockRestore();
  });
});
