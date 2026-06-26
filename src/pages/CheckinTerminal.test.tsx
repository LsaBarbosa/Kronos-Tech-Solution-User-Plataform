import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CheckinTerminal from "./CheckinTerminal";
import { submitCheckinFace } from "@/service/checkin-terminal.service";

vi.mock("@/service/checkin-terminal.service", () => ({
  submitCheckinFace: vi.fn(),
}));

const mockSubmitCheckinFace = vi.mocked(submitCheckinFace);
const stopTrack = vi.fn();
const getUserMedia = vi.fn();
const getCurrentPosition = vi.fn();

const mediaStream = {
  getTracks: () => [{ stop: stopTrack }],
} as unknown as MediaStream;

const installBrowserMocks = () => {
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia },
  });

  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: { getCurrentPosition },
  });

  Object.defineProperty(HTMLVideoElement.prototype, "videoWidth", {
    configurable: true,
    value: 640,
  });
  Object.defineProperty(HTMLVideoElement.prototype, "videoHeight", {
    configurable: true,
    value: 480,
  });

  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    drawImage: vi.fn(),
  }) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.toDataURL = vi.fn().mockReturnValue("data:image/jpeg;base64,face-payload");
};

const allowCameraAndLocation = () => {
  getUserMedia.mockResolvedValue(mediaStream);
  getCurrentPosition.mockImplementation((success: PositionCallback) => {
    success({
      coords: {
        latitude: -23.55,
        longitude: -46.63,
        accuracy: 18,
      },
    } as GeolocationPosition);
  });
};

describe("CheckinTerminal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    installBrowserMocks();
    allowCameraAndLocation();
    mockSubmitCheckinFace.mockResolvedValue({
      loginMessage: "Identificação realizada com sucesso.",
      recordMessage: "Entrada registrada com sucesso.",
      actionType: "CHECKIN",
      autoLogoutAfterSeconds: 10,
      recordedAt: "2026-06-26T08:01:00-03:00",
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("exibe o estado inicial com Registrar entrada", () => {
    render(<CheckinTerminal />);

    expect(screen.getByRole("heading", { name: /Registro de ponto/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Registrar entrada/i })).toBeInTheDocument();
    expect(screen.queryByText(/Dashboard/i)).not.toBeInTheDocument();
  });

  it("exibe botão Reiniciar camera durante a etapa de camera", async () => {
    render(<CheckinTerminal />);

    fireEvent.click(screen.getByRole("button", { name: /Registrar entrada/i }));

    expect(await screen.findByRole("button", { name: /Reiniciar camera/i })).toBeInTheDocument();
    expect(getUserMedia).toHaveBeenCalledWith({ video: { facingMode: "user" }, audio: false });
  });

  it("faz login facial e reaproveita a mesma foto para o registro de ponto", async () => {
    const scheduledResets: Array<() => void> = [];
    const originalSetTimeout = window.setTimeout.bind(window);
    const setTimeoutSpy = vi.spyOn(window, "setTimeout").mockImplementation((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
      if (timeout === 10000 && typeof handler === "function") {
        scheduledResets.push(handler);
        return 1;
      }

      return originalSetTimeout(handler, timeout, ...args);
    });
    render(<CheckinTerminal />);

    fireEvent.click(screen.getByRole("button", { name: /Registrar entrada/i }));
    await screen.findByRole("button", { name: /Tirar foto/i });
    fireEvent.click(screen.getByRole("button", { name: /Tirar foto/i }));

    expect(await screen.findByText(/Identificação realizada com sucesso/i)).toBeInTheDocument();
    expect(screen.getByText(/Entrada registrada com sucesso/i)).toBeInTheDocument();
    expect(screen.getByText("Entrada registrada")).toBeInTheDocument();
    expect(mockSubmitCheckinFace).toHaveBeenCalledTimes(1);
    expect(mockSubmitCheckinFace).toHaveBeenCalledWith({
      faceImageBase64: "face-payload",
      latitude: -23.55,
      longitude: -46.63,
      accuracy: 18,
      livenessPassed: true,
    });
    expect(stopTrack).toHaveBeenCalled();

    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 10000);
    act(() => {
      scheduledResets[0]?.();
    });

    expect(screen.getByRole("button", { name: /Registrar entrada/i })).toBeInTheDocument();
    expect(screen.queryByText(/Identificação realizada com sucesso/i)).not.toBeInTheDocument();
  });

  it("botão Sair reseta a tela e limpa recursos", async () => {
    render(<CheckinTerminal />);

    fireEvent.click(screen.getByRole("button", { name: /Registrar entrada/i }));
    await screen.findByRole("button", { name: /Tirar foto/i });
    fireEvent.click(screen.getByRole("button", { name: /Tirar foto/i }));

    expect(await screen.findByRole("button", { name: /Sair/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Sair/i }));

    expect(screen.getByRole("button", { name: /Registrar entrada/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Sair/i })).not.toBeInTheDocument();
    expect(stopTrack).toHaveBeenCalled();
  });
});
