import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./pages/CheckinTerminal", () => ({
  default: () => <h1>Terminal público de ponto</h1>,
}));

describe("App checkin routes", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  it("renderiza a página do terminal em /", async () => {
    const { default: App } = await import("./App");

    render(<App />);

    expect(await screen.findByRole("heading", { name: "Terminal público de ponto" })).toBeInTheDocument();
  });

  it("renderiza a página do terminal em /checkin", async () => {
    window.history.pushState({}, "", "/checkin");
    const { default: App } = await import("./App");

    render(<App />);

    expect(await screen.findByRole("heading", { name: "Terminal público de ponto" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/checkin");
  });

  it("redireciona rota desconhecida para /", async () => {
    window.history.pushState({}, "", "/dashboard");
    const { default: App } = await import("./App");

    render(<App />);

    await waitFor(() => {
      expect(window.location.pathname).toBe("/");
    });
    expect(await screen.findByRole("heading", { name: "Terminal público de ponto" })).toBeInTheDocument();
  });
});
