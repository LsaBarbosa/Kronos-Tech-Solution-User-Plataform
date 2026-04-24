import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RoleRoute from "./RoleRoute";
import { useAuth } from "@/context/AuthContext";
import type { AppRole } from "@/config/app-routes";

vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);

const renderRoleRoute = (allowedRoles: readonly AppRole[], initialPath = "/admin-protected") =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/dashboard" element={<div>Dashboard</div>} />
        <Route path="/admin" element={<div>Admin público</div>} />
        <Route path="/forbidden" element={<div>Acesso negado</div>} />
        <Route element={<RoleRoute allowedRoles={allowedRoles} />}>
          <Route path="/admin-protected" element={<div>Admin protegido</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

describe("RoleRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("bloqueia acesso quando a role nao esta permitida", () => {
    mockUseAuth.mockReturnValue({
      status: "authenticated",
      user: null,
      role: "PARTNER",
      token: null,
      isAuthenticated: true,
      checkSession: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderRoleRoute(["MANAGER"]);

    expect(screen.queryByText("Admin protegido")).not.toBeInTheDocument();
  });

  it("libera acesso quando a role esta permitida", () => {
    mockUseAuth.mockReturnValue({
      status: "authenticated",
      user: null,
      role: "MANAGER",
      token: null,
      isAuthenticated: true,
      checkSession: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderRoleRoute(["MANAGER"]);

    expect(screen.getByText("Admin protegido")).toBeInTheDocument();
  });

  it("libera acesso para CTO quando a rota aceita CTO e MANAGER", () => {
    mockUseAuth.mockReturnValue({
      status: "authenticated",
      user: null,
      role: "CTO",
      token: null,
      isAuthenticated: true,
      checkSession: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderRoleRoute(["MANAGER", "CTO"]);

    expect(screen.getByText("Admin protegido")).toBeInTheDocument();
  });

  it("libera acesso quando nao ha roles restritas", () => {
    mockUseAuth.mockReturnValue({
      status: "authenticated",
      user: null,
      role: "PARTNER",
      token: null,
      isAuthenticated: true,
      checkSession: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/admin-protected"]}>
        <Routes>
          <Route element={<RoleRoute allowedRoles={[]} />}>
            <Route path="/admin-protected" element={<div>Admin protegido</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Admin protegido")).toBeInTheDocument();
  });

  it("redireciona para a rota configurada quando a role nao esta permitida", () => {
    mockUseAuth.mockReturnValue({
      status: "authenticated",
      user: null,
      role: "PARTNER",
      token: null,
      isAuthenticated: true,
      checkSession: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/admin-protected"]}>
        <Routes>
          <Route path="/forbidden" element={<div>Acesso negado</div>} />
          <Route element={<RoleRoute allowedRoles={["MANAGER"]} redirectTo="/forbidden" />}>
            <Route path="/admin-protected" element={<div>Admin protegido</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Acesso negado")).toBeInTheDocument();
    expect(screen.queryByText("Admin protegido")).not.toBeInTheDocument();
  });
});
