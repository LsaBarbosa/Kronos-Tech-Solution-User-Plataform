import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginForm from "./LoginForm";
import { loginWithPassword } from "@/service/auth.service";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

const navigateMock = vi.fn();
const authLoginMock = vi.fn();

vi.mock("@/components/Clock", () => ({
  default: () => <div data-testid="clock" />,
}));

vi.mock("@/components/FaceLoginModal", () => ({
  default: () => <div data-testid="face-login-modal" />,
}));

vi.mock("@/service/auth.service", () => ({
  loginWithPassword: vi.fn(),
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

const mockLoginWithPassword = vi.mocked(loginWithPassword);
const mockUseAuth = vi.mocked(useAuth);
const mockToast = vi.mocked(toast);

const renderLoginForm = () =>
  render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  );

const fillAndSubmit = async () => {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText(/Nome de Usuário/i), "ana");
  await user.type(screen.getByLabelText(/^Senha/i), "senha123");
  await user.click(screen.getByRole("button", { name: "Entrar" }));
};

describe("LoginForm", () => {
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
  });

  it("chama o service com as credenciais do formulario", async () => {
    mockLoginWithPassword.mockResolvedValue(undefined);

    renderLoginForm();
    await fillAndSubmit();

    await waitFor(() => {
      expect(mockLoginWithPassword).toHaveBeenCalledWith({
        username: "ana",
        password: "senha123",
      });
    });
  });

  it("atualiza sessao global via AuthContext e redireciona apos login de sucesso", async () => {
    mockLoginWithPassword.mockResolvedValue(undefined);

    renderLoginForm();
    await fillAndSubmit();

    await waitFor(() => {
      expect(authLoginMock).toHaveBeenCalledWith();
    });
    expect(mockToast.success).toHaveBeenCalledWith("Login realizado com sucesso!");
    expect(navigateMock).toHaveBeenCalledWith("/dashboard", { replace: true });
  });

  it("exibe erro uniforme quando credenciais sao invalidas", async () => {
    mockLoginWithPassword.mockRejectedValue(
      new Error("Usuario ou senha invalidos.")
    );

    renderLoginForm();
    await fillAndSubmit();

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Usuario ou senha invalidos.");
    });
    expect(authLoginMock).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
