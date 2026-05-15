import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, HttpResponse, http } from "msw";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";
import { server } from "@/test/mocks/server";
import * as csrfService from "@/service/csrf.service";

const AuthProbe = () => {
  const { status, role, user, isAuthenticated, logout, login } = useAuth();

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
    server.use(
      http.get("*/employee/own-profile", () =>
        HttpResponse.json({
          employeeId: "e-1",
          fullName: "Ana",
          role: "MANAGER",
          accountData: {
            userId: "u-1",
            username: "ana",
          },
        })
      )
    );

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated");
    });
    expect(screen.getByTestId("role")).toHaveTextContent("MANAGER");
    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
  });

  it.each([401, 403])(
    "deve mudar para unauthenticated em caso de %i",
    async (statusCode) => {
      server.use(
        http.get("*/employee/own-profile", () =>
          HttpResponse.json({}, { status: statusCode })
        )
      );

      renderAuthProvider();

      await waitFor(() => {
        expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated");
      });
      expect(screen.getByTestId("is-authenticated")).toHaveTextContent("false");
    }
  );

  it("mantem sessao autenticada quando o termo esta pendente", async () => {
    server.use(
      http.get("*/employee/own-profile", () =>
        HttpResponse.json(
          {
            type: "TERMS_NOT_ACCEPTED",
            message: "Aceite de termo pendente",
          },
          { status: 403 }
        )
      )
    );

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated");
    });
    expect(screen.getByTestId("user")).toHaveTextContent("");
    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
  });

  it("logout limpa contexto localmente", async () => {
    server.use(
      http.get("*/employee/own-profile", () =>
        HttpResponse.json({
          employeeId: "e-1",
          fullName: "Ana",
          role: "MANAGER",
          accountData: {
            userId: "u-1",
            username: "ana",
          },
        })
      ),
      http.post("*/auth/logout", () => new HttpResponse(null, { status: 204 }))
    );

    renderAuthProvider();

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
      http.get("*/employee/own-profile", () =>
        HttpResponse.json({
          employeeId: "e-1",
          fullName: "Ana",
          role: "MANAGER",
          accountData: {
            userId: "u-1",
            username: "ana",
          },
        })
      ),
      http.post("*/auth/logout", () => new HttpResponse(null, { status: 204 }))
    );

    renderAuthProvider();

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
      http.get("*/employee/own-profile", () =>
        HttpResponse.json({
          employeeId: "e-1",
          fullName: "Ana",
          role: "MANAGER",
          accountData: {
            userId: "u-1",
            username: "ana",
          },
        })
      ),
      http.post("*/auth/logout", () => new HttpResponse(null, { status: 500 }))
    );

    renderAuthProvider();

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
    server.use(
      http.get("*/employee/own-profile", () =>
        HttpResponse.json({
          employeeId: "e-1",
          fullName: "Ana",
          role: "MANAGER",
          accountData: {
            userId: "u-1",
            username: "ana",
          },
        })
      )
    );

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated");
    });

    await userEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated");
    });
  });
});
