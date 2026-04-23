import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);

const setAuthStatus = (status: "checking" | "authenticated" | "unauthenticated") => {
  mockUseAuth.mockReturnValue({
    status,
    user: null,
    role: "",
    token: null,
    isAuthenticated: status === "authenticated",
    checkSession: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  });
};

const renderProtectedRoute = (initialPath = "/dashboard") =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<div>Login publico</div>} />
        <Route path="/login" element={<div>Pagina de login</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Dashboard protegido</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza loader quando sessao esta em analise", () => {
    setAuthStatus("checking");

    renderProtectedRoute();

    expect(screen.getByRole("status")).toHaveTextContent("Carregando sessão...");
    expect(screen.queryByText("Dashboard protegido")).not.toBeInTheDocument();
    expect(screen.queryByText("Pagina de login")).not.toBeInTheDocument();
  });

  it("redireciona para login quando nao autenticado", () => {
    setAuthStatus("unauthenticated");

    renderProtectedRoute();

    expect(screen.getByText("Pagina de login")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard protegido")).not.toBeInTheDocument();
  });

  it("renderiza a rota filha quando autenticado", () => {
    setAuthStatus("authenticated");

    renderProtectedRoute();

    expect(screen.getByText("Dashboard protegido")).toBeInTheDocument();
    expect(screen.queryByText("Pagina de login")).not.toBeInTheDocument();
  });
});
