import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FaceLoginModal from "./FaceLoginModal";
import { loginWithFace } from "@/service/auth.service";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

const navigateMock = vi.fn();
const authLoginMock = vi.fn();
const onOpenChangeMock = vi.fn();

vi.mock("@/service/auth.service", () => ({
  loginWithFace: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  useToast: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const mockLoginWithFace = vi.mocked(loginWithFace);
const mockUseAuth = vi.mocked(useAuth);
const mockToast = vi.mocked(toast);

const mockTrackStop = vi.fn();
const mockDrawImage = vi.fn();

const renderFaceLoginModal = () =>
  render(
    <MemoryRouter>
      <FaceLoginModal isOpen onOpenChange={onOpenChangeMock} />
    </MemoryRouter>
  );

const captureFace = async () => {
  const user = userEvent.setup();

  const video = await screen.findByText("Capturar Rosto").then(() =>
    document.querySelector("video")
  );

  expect(video).not.toBeNull();
  fireEvent.loadedMetadata(video as HTMLVideoElement);

  const captureButton = screen.getByRole("button", { name: /capturar rosto/i });
  await waitFor(() => expect(captureButton).toBeEnabled());
  await user.click(captureButton);
};

describe("FaceLoginModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    authLoginMock.mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({
      status: "unauthenticated",
      user: null,
      role: "",
      token: null,
      isAuthenticated: false,
      checkSession: vi.fn(),
      login: authLoginMock,
      logout: vi.fn(),
    });

    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: mockTrackStop }],
        }),
      },
    });

    Object.defineProperty(HTMLMediaElement.prototype, "play", {
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined),
    });

    Object.defineProperty(HTMLVideoElement.prototype, "videoWidth", {
      configurable: true,
      get: () => 400,
    });
    Object.defineProperty(HTMLVideoElement.prototype, "videoHeight", {
      configurable: true,
      get: () => 300,
    });

    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      drawImage: mockDrawImage,
    }) as unknown as typeof HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.toDataURL = vi
      .fn()
      .mockReturnValue(`data:image/jpeg;base64,${"a".repeat(120)}`);
  });

  it("chama o service corretamente com a imagem capturada", async () => {
    mockLoginWithFace.mockResolvedValue({ token: "token-face" });
    const user = userEvent.setup();

    renderFaceLoginModal();
    await captureFace();
    await user.click(screen.getByRole("button", { name: /confirmar/i }));

    await waitFor(() => {
      expect(mockLoginWithFace).toHaveBeenCalledWith({
        faceImageBase64: "a".repeat(120),
      });
    });
  });

  it("atualiza sessao global e redireciona no login facial com sucesso", async () => {
    mockLoginWithFace.mockResolvedValue({ token: "token-face" });
    const user = userEvent.setup();

    renderFaceLoginModal();
    await captureFace();
    await user.click(screen.getByRole("button", { name: /confirmar/i }));

    await waitFor(() => {
      expect(authLoginMock).toHaveBeenCalledWith("token-face");
    });
    expect(mockToast.success).toHaveBeenCalledWith(
      "Identidade confirmada! Acessando plataforma...",
      { duration: 2000 }
    );
    expect(onOpenChangeMock).toHaveBeenCalledWith(false);
    expect(navigateMock).toHaveBeenCalledWith("/dashboard", { replace: true });
  });

  it("mostra mensagem padronizada quando login facial falha", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mockLoginWithFace.mockRejectedValue(new Error("Face nao reconhecida."));
    const user = userEvent.setup();

    renderFaceLoginModal();
    await captureFace();
    await user.click(screen.getByRole("button", { name: /confirmar/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Face nao reconhecida.");
    });
    expect(authLoginMock).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
