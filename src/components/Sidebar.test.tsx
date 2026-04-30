import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Sidebar from "./Sidebar";
import { useAuth } from "@/context/AuthContext";

const navigateMock = vi.fn();
const logoutMock = vi.fn();
const toggleSidebarMock = vi.fn();

vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock("@/service/fiscal.service", () => ({
  FiscalService: {
    downloadMirror: vi.fn(),
    downloadAfd: vi.fn(),
    downloadAej: vi.fn(),
    downloadTechnicalCertificate: vi.fn(),
  },
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

const mockUseAuth = vi.mocked(useAuth);

const setRole = (role: "CTO" | "MANAGER" | "PARTNER" | "") => {
  mockUseAuth.mockReturnValue({
    status: "authenticated",
    user: null,
    role,
    token: "token-valido",
    isAuthenticated: true,
    checkSession: vi.fn(),
    login: vi.fn(),
    logout: logoutMock,
  });
};

const renderSidebar = () =>
  render(
    <MemoryRouter>
      <Sidebar isOpen toggleSidebar={toggleSidebarMock} />
    </MemoryRouter>
  );

describe("Sidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setRole("");
  });

  it("logout limpa sessao via contexto e redireciona para login", async () => {
    renderSidebar();

    await userEvent.click(screen.getByRole("button", { name: /sair/i }));

    expect(logoutMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith("/login", { replace: true });
    expect(toggleSidebarMock).toHaveBeenCalledTimes(1);
  });

  it("renderiza auditoria fiscal para CTO via metadados da rota", async () => {
    setRole("CTO");

    renderSidebar();

    await userEvent.click(screen.getByRole("button", { name: /administrador/i }));

    expect(screen.getByRole("button", { name: /auditoria fiscal/i })).toBeInTheDocument();
  });

  it("renderiza auditoria fiscal para MANAGER", async () => {
    setRole("MANAGER");

    renderSidebar();

    await userEvent.click(screen.getByRole("button", { name: /administrador/i }));

    expect(screen.getByRole("button", { name: /auditoria fiscal/i })).toBeInTheDocument();
  });

  it("não renderiza auditoria fiscal para PARTNER", () => {
    setRole("PARTNER");

    renderSidebar();

    expect(screen.queryByRole("button", { name: /administrador/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /auditoria fiscal/i })).not.toBeInTheDocument();
  });
});
