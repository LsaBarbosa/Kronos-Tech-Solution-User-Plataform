import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";
import { server } from "@/test/mocks/server";

const AuthProbe = () => {
  const { status, role, token, user, isAuthenticated, logout, login } = useAuth();

  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="role">{role}</span>
      <span data-testid="token">{token ?? ""}</span>
      <span data-testid="user">{user?.account.userId ?? ""}</span>
      <span data-testid="is-authenticated">{String(isAuthenticated)}</span>
      <button type="button" onClick={logout}>
        Logout
      </button>
      <button type="button" onClick={() => void login("rotated-token")}>
        Login
      </button>
    </div>
  );
};

const renderAuthProvider = () =>
  render(
    <AuthProvider>
      <AuthProbe />
    </AuthProvider>
  );

describe("AuthProvider", () => {
  it("deve iniciar com status checking", () => {
    localStorage.setItem("token", "valid-token");

    server.use(
      http.get("*/users/own-profile", async () => {
        await delay(100);
        return HttpResponse.json({
          userId: "u-1",
          username: "ana",
          role: "MANAGER",
          active: true,
          employeeId: "e-1",
        });
      }),
      http.get("*/employee/own-profile", async () => {
        await delay(100);
        return HttpResponse.json({
          employeeId: "e-1",
          fullName: "Ana",
          role: "MANAGER",
        });
      })
    );

    renderAuthProvider();

    expect(screen.getByTestId("status")).toHaveTextContent("checking");
  });

  it("deve mudar para authenticated quando a sessao for valida", async () => {
    localStorage.setItem("token", "valid-token");

    server.use(
      http.get("*/users/own-profile", () =>
        HttpResponse.json({
          userId: "u-1",
          username: "ana",
          role: "MANAGER",
          active: true,
          employeeId: "e-1",
        })
      ),
      http.get("*/employee/own-profile", () =>
        HttpResponse.json({
          employeeId: "e-1",
          fullName: "Ana",
          role: "MANAGER",
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
      localStorage.setItem("token", "invalid-token");

      server.use(
        http.get("*/users/own-profile", () =>
          HttpResponse.json({}, { status: statusCode })
        ),
        http.get("*/employee/own-profile", () =>
          HttpResponse.json({
            employeeId: "e-1",
            fullName: "Ana",
            role: "MANAGER",
          })
        )
      );

      renderAuthProvider();

      await waitFor(() => {
        expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated");
      });
    expect(localStorage.getItem("token")).toBeNull();
    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("false");
    }
  );

  it("logout limpa token e contexto localmente", async () => {
    localStorage.setItem("token", "valid-token");

    server.use(
      http.get("*/users/own-profile", () =>
        HttpResponse.json({
          userId: "u-1",
          username: "ana",
          role: "MANAGER",
          active: true,
          employeeId: "e-1",
        })
      ),
      http.get("*/employee/own-profile", () =>
        HttpResponse.json({
          employeeId: "e-1",
          fullName: "Ana",
          role: "MANAGER",
        })
      )
    );

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated");
    });

    await userEvent.click(screen.getByRole("button", { name: "Logout" }));

    expect(localStorage.getItem("token")).toBeNull();
    expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated");
    expect(screen.getByTestId("token")).toHaveTextContent("");
    expect(screen.getByTestId("user")).toHaveTextContent("");
    expect(screen.getByTestId("role")).toHaveTextContent("");
    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("false");
  });

  it("login substitui o token persistido e recarrega a sessao", async () => {
    localStorage.setItem("token", "old-token");
    const seenAuthorizations: string[] = [];

    server.use(
      http.get("*/users/own-profile", ({ request }) => {
        seenAuthorizations.push(request.headers.get("authorization") ?? "");

        return HttpResponse.json({
          userId: "u-1",
          username: "ana",
          role: "MANAGER",
          active: true,
          employeeId: "e-1",
        });
      }),
      http.get("*/employee/own-profile", ({ request }) => {
        seenAuthorizations.push(request.headers.get("authorization") ?? "");

        return HttpResponse.json({
          employeeId: "e-1",
          fullName: "Ana",
          role: "MANAGER",
        });
      })
    );

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated");
    });

    await userEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("rotated-token");
      expect(screen.getByTestId("token")).toHaveTextContent("rotated-token");
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated");
    });

    expect(seenAuthorizations).toContain("Bearer old-token");
    expect(seenAuthorizations).toContain("Bearer rotated-token");
  });
});
