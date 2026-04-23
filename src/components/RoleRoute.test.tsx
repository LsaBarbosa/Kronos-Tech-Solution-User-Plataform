import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RoleRoute from "./RoleRoute";
import { useAuth } from "@/context/AuthContext";

vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);

const renderRoleRoute = (allowedRoles: string[], initialPath = "/admin-protected") =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/dashboard" element={<div>Dashboard</div>} />
        <Route path="/admin" element={<div>Admin público</div>} />
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
});
