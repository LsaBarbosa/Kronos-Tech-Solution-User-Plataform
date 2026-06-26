import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TerminalCheckinPage from "./TerminalCheckinPage";
import { useAuth } from "@/context/AuthContext";
import { submitTerminalCheckin } from "@/service/terminal-checkin.service";
import { captureFrameFromVideo, startCameraStream, stopCameraStream } from "@/utils/camera.util";
import { getCurrentLocation } from "@/utils/geolocation.util";

vi.mock("@/service/terminal-checkin.service", () => ({
  submitTerminalCheckin: vi.fn(),
}));

vi.mock("@/utils/geolocation.util", () => ({
  getCurrentLocation: vi.fn(),
}));

vi.mock("@/utils/camera.util", () => ({
  startCameraStream: vi.fn(),
  stopCameraStream: vi.fn(),
  captureFrameFromVideo: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);
const mockSubmitTerminalCheckin = vi.mocked(submitTerminalCheckin);
const mockGetCurrentLocation = vi.mocked(getCurrentLocation);
const mockStartCameraStream = vi.mocked(startCameraStream);
const mockStopCameraStream = vi.mocked(stopCameraStream);
const mockCaptureFrameFromVideo = vi.mocked(captureFrameFromVideo);
const logoutMock = vi.fn();

const desktopMediaQuery = "(min-width: 1024px)";

const setDesktopViewport = (isDesktop: boolean) => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === desktopMediaQuery ? isDesktop : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

const flushFlow = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
};

describe("TerminalCheckinPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    setDesktopViewport(true);

    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      logout: logoutMock,
    } as never);

    mockGetCurrentLocation.mockResolvedValue({
      latitude: -22.9,
      longitude: -43.2,
      accuracy: 18.5,
    });
    mockStartCameraStream.mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }],
    } as unknown as MediaStream);
    mockCaptureFrameFromVideo.mockReturnValue(
      `data:image/jpeg;base64,${"a".repeat(160)}`
    );

    Object.defineProperty(HTMLMediaElement.prototype, "play", {
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renderiza a experiência desktop dedicada", () => {
    render(<TerminalCheckinPage />);

    expect(screen.getByTestId("terminal-checkin-desktop")).toBeInTheDocument();
    expect(screen.getByText("Operação assistida em tela ampla")).toBeInTheDocument();
  });

  it("renderiza a experiência mobile dedicada", () => {
    setDesktopViewport(false);

    render(<TerminalCheckinPage />);

    expect(screen.getByTestId("terminal-checkin-mobile")).toBeInTheDocument();
    expect(screen.getByText("Modo toque rápido")).toBeInTheDocument();
  });

  it("mantém a ordem texto, ações e card final no mobile", () => {
    setDesktopViewport(false);

    render(<TerminalCheckinPage />);

    const copy = screen.getByTestId("terminal-checkin-mobile-copy");
    const actions = screen.getByTestId("terminal-checkin-mobile-actions");
    const status = screen.getByTestId("terminal-checkin-mobile-status");

    expect(copy.compareDocumentPosition(actions) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(actions.compareDocumentPosition(status) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("coleta dados, envia ao endpoint novo e reseta ao final do countdown", async () => {
    vi.useFakeTimers();
    mockSubmitTerminalCheckin.mockResolvedValue({
      loginMessage: "Login realizado com sucesso.",
      recordMessage: "Entrada às 08:01! (NSR: 123)",
      actionType: "CHECKIN",
      autoLogoutAfterSeconds: 10,
      recordedAt: "2026-06-26T08:01:00-03:00",
    });

    render(<TerminalCheckinPage />);

    fireEvent.click(screen.getByRole("button", { name: /iniciar terminal/i }));

    await flushFlow();
    expect(screen.getByRole("button", { name: /registrar ponto/i })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: /registrar ponto/i }));

    await flushFlow();
    expect(mockSubmitTerminalCheckin).toHaveBeenCalledWith({
      faceImageBase64: "a".repeat(160),
      latitude: -22.9,
      longitude: -43.2,
      accuracy: 18.5,
      livenessPassed: false,
    });
    expect(screen.getByText("Login realizado com sucesso.")).toBeInTheDocument();
    expect(screen.getByText("Entrada às 08:01! (NSR: 123)")).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });

    await flushFlow();
    expect(logoutMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: /iniciar terminal/i })).toBeInTheDocument();
    expect(mockStopCameraStream).toHaveBeenCalled();
  });

  it("permite reiniciar o fluxo após erro", async () => {
    mockSubmitTerminalCheckin.mockRejectedValue(new Error("Face nao reconhecida."));

    render(<TerminalCheckinPage />);

    fireEvent.click(screen.getByRole("button", { name: /iniciar terminal/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /registrar ponto/i })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole("button", { name: /registrar ponto/i }));

    await screen.findByText(
      "Não foi possível identificar o colaborador. Ajuste o enquadramento e tente novamente."
    );

    fireEvent.click(screen.getByRole("button", { name: /reiniciar fluxo/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /iniciar terminal/i })).toBeInTheDocument();
    });
    expect(logoutMock).not.toHaveBeenCalled();
  });
});
