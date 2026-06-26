import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import AssinaturaPonto from "./AssinaturaPonto";
import type { PreviousMonthSignatureStatus } from "@/types/timesheet-signature";

const toastMock = vi.fn();

const cameraMock = vi.hoisted(() => ({
  startCameraStream: vi.fn(),
  stopCameraStream: vi.fn(),
  captureFrameFromVideo: vi.fn(),
}));

vi.mock("@/utils/camera.util", () => cameraMock);

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));

vi.mock("@/components/PageShell", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="page-shell">{children}</div>,
}));

vi.mock("@/components/faq/FaqContextualBlock", () => ({
  FaqContextualBlock: () => null,
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
  getMonthStatus: vi.fn(),
  fetchMonthPreviewPdf: vi.fn(),
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
    serviceMock.getMonthStatus.mockResolvedValueOnce(baseStatus());

    renderPage();

    expect(await screen.findByText(/Assinatura do Ponto/i)).toBeInTheDocument();
    expect(await screen.findByText(/Pronto para assinar/i)).toBeInTheDocument();
    expect(screen.getByText(/Confirme a declaração/i)).toBeInTheDocument();
  });

  it("lista bloqueios e não exibe o formulário quando status está BLOCKED", async () => {
    serviceMock.getMonthStatus.mockResolvedValueOnce(
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
    serviceMock.getMonthStatus.mockResolvedValueOnce(baseStatus());

    renderPage();

    const button = await screen.findByRole("button", { name: /Assinar ponto/i });
    expect(button).toBeDisabled();
  });

  it("submete e limpa a imagem após a tentativa", async () => {
    serviceMock.getMonthStatus.mockResolvedValueOnce(baseStatus());
    serviceMock.fetchMonthPreviewPdf.mockResolvedValueOnce({
      blob: new Blob([new Uint8Array([1, 2, 3])], { type: "application/pdf" }),
    });
    serviceMock.sign.mockResolvedValueOnce({
      signatureId: "sig-1",
      referenceYear: 2026,
      referenceMonth: 5,
      signedAt: "2026-06-01T12:00:00Z",
      signatureType: "INTERNAL_ADVANCED",
      signatureMethod: "FACIAL_RECOGNITION",
      pointMirrorHashSha256: "hash-do-pdf",
      recordsSnapshotHashSha256: "hash-records",
      pointMirrorDocumentId: null,
      declarationVersion: "1.0",
    });
    serviceMock.getMonthStatus.mockResolvedValue(
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

    cameraMock.startCameraStream.mockResolvedValue({} as MediaStream);
    cameraMock.captureFrameFromVideo.mockReturnValue("data:image/jpeg;base64,abc123");
    Object.defineProperty(HTMLVideoElement.prototype, "play", {
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined),
    });

    const user = userEvent.setup();
    const openSpy = vi.spyOn(window, "open").mockReturnValue(null);

    renderPage();

    const previewButton = await screen.findByRole("button", { name: /Abrir espelho/i });
    await user.click(previewButton);

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    // Inicia câmera
    const cameraButton = screen.getByRole("button", { name: /Ativar câmera/i });
    await user.click(cameraButton);

    // Captura foto
    const captureButton = await screen.findByRole("button", { name: /Capturar/i });
    await user.click(captureButton);

    // Foto aparece no DOM
    expect(screen.getByAltText("Foto capturada")).toBeInTheDocument();

    const submit = screen.getByRole("button", { name: /Assinar ponto/i });
    await waitFor(() => expect(submit).not.toBeDisabled());
    await user.click(submit);

    await waitFor(() => expect(serviceMock.sign).toHaveBeenCalledTimes(1));
    expect(serviceMock.sign).toHaveBeenCalledWith(
      expect.objectContaining({ faceImageBase64: "abc123" })
    );

    // Após submissão (sucesso), imagem é limpa do estado
    await waitFor(() =>
      expect(screen.queryByAltText("Foto capturada")).not.toBeInTheDocument()
    );
    openSpy.mockRestore();
  });
});
