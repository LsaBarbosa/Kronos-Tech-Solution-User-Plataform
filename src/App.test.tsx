import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./pages/CheckinTerminal", () => ({
  default: () => (
    <main>
      <h1>Registro de ponto</h1>
      <button type="button">Registrar entrada</button>
    </main>
  ),
}));

describe("App checkin routes", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  it("renderiza a página de check-in em /", async () => {
    const { default: App } = await import("./App");

    render(<App />);

    expect(await screen.findByRole("heading", { name: /Registro de ponto/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Registrar entrada/i })).toBeInTheDocument();
  });

  it("renderiza a página de check-in em /checkin", async () => {
    window.history.pushState({}, "", "/checkin");
    const { default: App } = await import("./App");

    render(<App />);

    expect(await screen.findByRole("heading", { name: /Registro de ponto/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Registrar entrada/i })).toBeInTheDocument();
  });

  it("redireciona rota desconhecida para /", async () => {
    window.history.pushState({}, "", "/dashboard");
    const { default: App } = await import("./App");

    render(<App />);

    await waitFor(() => {
      expect(window.location.pathname).toBe("/");
    });
    expect(await screen.findByRole("heading", { name: /Registro de ponto/i })).toBeInTheDocument();
  });

  it("não renderiza páginas da plataforma completa", async () => {
    const { default: App } = await import("./App");

    render(<App />);

    await screen.findByRole("heading", { name: /Registro de ponto/i });
    expect(screen.queryByText(/Dashboard/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Administração/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Login/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Documentos/i)).not.toBeInTheDocument();
  });
});
