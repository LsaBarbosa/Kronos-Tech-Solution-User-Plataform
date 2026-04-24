import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import App from "./App";
import { server } from "@/test/mocks/server";

const setAuthenticatedSession = (role: "PARTNER" | "MANAGER" | "CTO") => {
  localStorage.setItem("token", `${role.toLowerCase()}-token`);

  server.use(
    http.get("*/users/own-profile", () =>
      HttpResponse.json({
        userId: "user-1",
        username: "maria.silva",
        role,
        active: true,
        employeeId: "emp-1",
      })
    ),
    http.get("*/employee/own-profile", () =>
      HttpResponse.json({
        employeeId: "emp-1",
        fullName: "Maria Silva",
        email: "maria@kronos.test",
        phone: "11999990000",
        role,
        companyName: "Kronos Tech",
        lastSeenMessageTimestamp: "2026-04-20T10:00:00Z",
      })
    )
  );
};

describe("App routes", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  it("permite que PARTNER navegue do dashboard para /meus-documentos sem cair em NotFound", async () => {
    setAuthenticatedSession("PARTNER");
    window.history.pushState({}, "", "/dashboard");

    render(<App />);

    const quickAccessTitle = await screen.findByText("Acesso Rápido");
    const quickAccessCard = quickAccessTitle.closest('[role="button"]');

    expect(quickAccessCard).not.toBeNull();

    await userEvent.click(quickAccessCard as HTMLElement);

    await screen.findByRole("heading", { name: "Buscar Documentos" });
    expect(screen.queryByText("404")).not.toBeInTheDocument();
  });

  it("bloqueia PARTNER em /criar-aviso e redireciona para o dashboard", async () => {
    setAuthenticatedSession("PARTNER");
    window.history.pushState({}, "", "/criar-aviso");

    render(<App />);

    await screen.findByText("Acesso Rápido");

    expect(window.location.pathname).toBe("/dashboard");
    expect(screen.queryByText("Criar Aviso")).not.toBeInTheDocument();
  });

  it("permite que MANAGER acesse /criar-aviso manualmente", async () => {
    setAuthenticatedSession("MANAGER");
    window.history.pushState({}, "", "/criar-aviso");

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Criar Aviso")).toBeInTheDocument();
    });
  });
});
