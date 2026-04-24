import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/hooks/useTheme";
import Dashboard from "./pages/Dashboard";

const setAuthenticatedSession = (role: "PARTNER" | "MANAGER" | "CTO") => {
  localStorage.setItem("token", `${role.toLowerCase()}-token`);
};

vi.mock("@/service/session-profile.service", () => ({
  loadSessionProfile: async () => {
    const token = localStorage.getItem("token") ?? "";
    const role = token.includes("manager")
      ? "MANAGER"
      : token.includes("cto")
        ? "CTO"
        : "PARTNER";

    return {
      accountData: {
        userId: "user-1",
        username: "maria.silva",
        role,
        active: true,
        employeeId: "emp-1",
      },
      profileData: {
        employeeId: "emp-1",
        fullName: "Maria Silva",
        email: "maria@kronos.test",
        phone: "11999990000",
        role,
        companyName: "Kronos Tech",
        lastSeenMessageTimestamp: "2026-04-20T10:00:00Z",
      },
      userData: {
        employeeId: "emp-1",
        fullName: "Maria Silva",
        email: "maria@kronos.test",
        phone: "11999990000",
        role,
        companyName: "Kronos Tech",
        lastSeenMessageTimestamp: "2026-04-20T10:00:00Z",
      },
      role,
    };
  },
}));

vi.mock("@/service/terms.service", () => ({
  getBiometricTermStatus: async () => ({ accepted: true }),
}));

vi.mock("@/hooks/useDashboardData", () => ({
  useDashboardData: () => {
    const token = localStorage.getItem("token") ?? "";
    const role = token.includes("manager")
      ? "MANAGER"
      : token.includes("cto")
        ? "CTO"
        : "PARTNER";

    return {
      userData: {
        fullName: "Maria Silva",
        email: "maria@kronos.test",
        phone: "11999990000",
        role,
        companyName: "Kronos Tech",
        salary: "5000",
        jobPosition: "Analista",
        lastSeenMessageTimestamp: "2026-04-20T10:00:00Z",
      },
      isLoading: false,
      pendingApprovalsCount: 0,
      newWarnings: [],
      hasApprovalPermission: false,
      fetchProfile: async () => undefined,
      handleWarningClick: async () => undefined,
    };
  },
}));

vi.mock("@/hooks/useVacationCount", () => ({
  useVacationCount: () => ({ pendingVacationCount: 0 }),
}));

vi.mock("@/hooks/useTimeOffCount", () => ({
  useTimeOffCount: () => ({ pendingTimeOffCount: 0 }),
}));

describe("App routes", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    window.history.pushState({}, "", "/");
  });

  it("permite que PARTNER navegue do dashboard para /meus-documentos sem cair em NotFound", async () => {
    setAuthenticatedSession("PARTNER");
    const LocationProbe = () => {
      const location = useLocation();

      return <div data-testid="location-probe">{location.pathname}</div>;
    };

    render(
      <ThemeProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={["/dashboard"]}>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/meus-documentos" element={<LocationProbe />} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    );

    const quickAccessCard = await screen.findByRole("button", {
      name: /Abrir acesso rápido para meus documentos/i,
    });

    await userEvent.click(quickAccessCard);

    await screen.findByTestId("location-probe");
    expect(screen.getByTestId("location-probe")).toHaveTextContent("/meus-documentos");
    expect(screen.queryByText("404")).not.toBeInTheDocument();
  });

  it("bloqueia PARTNER em /criar-aviso e redireciona para o dashboard", async () => {
    setAuthenticatedSession("PARTNER");
    window.history.pushState({}, "", "/criar-aviso");

    const { default: App } = await import("./App");
    render(<App />);

    await screen.findByRole("button", {
      name: /Abrir acesso rápido para meus documentos/i,
    });

    expect(window.location.pathname).toBe("/dashboard");
    expect(screen.queryByText("Criar Aviso")).not.toBeInTheDocument();
  });

  it("permite que MANAGER acesse /criar-aviso manualmente", async () => {
    setAuthenticatedSession("MANAGER");
    window.history.pushState({}, "", "/criar-aviso");

    const { default: App } = await import("./App");
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Criar Aviso")).toBeInTheDocument();
    });
  });
});
