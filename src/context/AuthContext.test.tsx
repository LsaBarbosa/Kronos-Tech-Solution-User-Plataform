import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, HttpResponse, http } from "msw";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";
import { server } from "@/test/mocks/server";
import * as csrfService from "@/service/csrf.service";
import { ServiceError } from "@/service/helpers/service-error.helper";
import { loadSessionProfile } from "@/service/session-profile.service";

vi.mock("@/service/session-profile.service", () => ({
  loadSessionProfile: vi.fn(),
}));

const mockLoadSessionProfile = vi.mocked(loadSessionProfile);

const sessionProfile = {
  accountData: {
    userId: "u-1",
    username: "ana",
    role: "MANAGER",
    active: true,
    employeeId: "e-1",
  },
  profileData: {
    employeeId: "e-1",
    fullName: "Ana",
    email: "ana@kronos.test",
    phone: "11999990000",
    role: "MANAGER",
    companyName: "Kronos Tech",
    lastSeenMessageTimestamp: null,
  },
  userData: {
    employeeId: "e-1",
    fullName: "Ana",
    email: "ana@kronos.test",
    phone: "11999990000",
    role: "MANAGER",
    companyName: "Kronos Tech",
    lastSeenMessageTimestamp: null,
  },
  role: "MANAGER",
} as const;

const AuthProbe = () => {
  const { status, role, user, isAuthenticated, logout, login, checkSession } = useAuth();

  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="role">{role}</span>
      <span data-testid="user">{user?.account.userId ?? ""}</span>
      <span data-testid="is-authenticated">{String(isAuthenticated)}</span>
      <button type="button" onClick={() => void logout()}>
        Logout
      </button>
      <button type="button" onClick={() => void login()}>
        Login
      </button>
      <button type="button" onClick={() => void checkSession()}>
        CheckSession
      </button>
    </div>
  );
};

const renderAuthProvider = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    </MemoryRouter>
  );

describe("AuthProvider", () => {
  beforeEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
    mockLoadSessionProfile.mockResolvedValue(sessionProfile);
  });

  it("deve iniciar com status checking", () => {
    server.use(
      http.get("*/employee/own-profile", async () => {
        await delay(100);
        return HttpResponse.json({
          employeeId: "e-1",
          fullName: "Ana",
          role: "MANAGER",
          accountData: {
            userId: "u-1",
            username: "ana",
          },
        });
      })
    );

    renderAuthProvider();

    expect(screen.getByTestId("status")).toHaveTextContent("checking");
  });

  it("deve mudar para authenticated quando a sessao for valida", async () => {
    renderAuthProvider();
    await userEvent.click(screen.getByRole("button", { name: "CheckSession" }));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated");
    });
    expect(screen.getByTestId("role")).toHaveTextContent("MANAGER");
    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
  });

  it.each([401, 403])(
    "deve mudar para unauthenticated em caso de %i",
    async (statusCode) => {
      mockLoadSessionProfile.mockRejectedValueOnce(
        new ServiceError("Sessão expirada", { kind: "auth", status: statusCode })
      );

      renderAuthProvider();
      await userEvent.click(screen.getByRole("button", { name: "CheckSession" }));

      await waitFor(() => {
        expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated");
      });
      expect(screen.getByTestId("is-authenticated")).toHaveTextContent("false");
    }
  );

  it("mantem sessao autenticada quando o termo esta pendente", async () => {
    mockLoadSessionProfile.mockRejectedValueOnce(
      new ServiceError("Aceite de termo pendente", {
        kind: "terms",
        status: 403,
        data: {
          code: "TERMS_NOT_ACCEPTED",
          message: "Aceite de termo pendente",
        },
      })
    );

    renderAuthProvider();
    await userEvent.click(screen.getByRole("button", { name: "CheckSession" }));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated");
    });
    expect(screen.getByTestId("user")).toHaveTextContent("");
    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
  });

  it("logout limpa contexto localmente", async () => {
    server.use(
      http.post("*/auth/logout", () => new HttpResponse(null, { status: 204 }))
    );

    renderAuthProvider();
    await userEvent.click(screen.getByRole("button", { name: "CheckSession" }));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated");
    });

    await userEvent.click(screen.getByRole("button", { name: "Logout" }));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated");
    });
    expect(screen.getByTestId("user")).toHaveTextContent("");
    expect(screen.getByTestId("role")).toHaveTextContent("");
    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("false");
  });

  it("logout invalida cache de CSRF token", async () => {
    const invalidateSpy = vi.spyOn(csrfService, "invalidateCsrfToken");

    server.use(
      http.post("*/auth/logout", () => new HttpResponse(null, { status: 204 }))
    );

    renderAuthProvider();
    await userEvent.click(screen.getByRole("button", { name: "CheckSession" }));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated");
    });

    await userEvent.click(screen.getByRole("button", { name: "Logout" }));

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalled();
    });

    invalidateSpy.mockRestore();
  });

  it("logout invalida CSRF mesmo em erro", async () => {
    const invalidateSpy = vi.spyOn(csrfService, "invalidateCsrfToken");

    server.use(
      http.post("*/auth/logout", () => new HttpResponse(null, { status: 500 }))
    );

    renderAuthProvider();
    await userEvent.click(screen.getByRole("button", { name: "CheckSession" }));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated");
    });

    await userEvent.click(screen.getByRole("button", { name: "Logout" }));

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalled();
    });

    invalidateSpy.mockRestore();
  });

  it("login recarrega a sessao", async () => {
    renderAuthProvider();
    await userEvent.click(screen.getByRole("button", { name: "CheckSession" }));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated");
    });

    await userEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated");
    });
    expect(mockLoadSessionProfile).toHaveBeenCalledTimes(2);
  });
});
