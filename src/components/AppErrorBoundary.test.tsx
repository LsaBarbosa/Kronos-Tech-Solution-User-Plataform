import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import AppErrorBoundary from "./AppErrorBoundary";
import * as browser from "@/lib/browser";

const BrokenComponent = () => {
  throw new Error("boom");
};

describe("AppErrorBoundary", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("renderiza fallback amigável quando um componente quebra", async () => {
    const redirectSpy = vi
      .spyOn(browser, "redirectBrowserTo")
      .mockImplementation(() => undefined);
    const reloadSpy = vi
      .spyOn(browser, "reloadBrowserPage")
      .mockImplementation(() => undefined);

    render(
      <AppErrorBoundary>
        <BrokenComponent />
      </AppErrorBoundary>
    );

    expect(
      screen.getByText("Algo inesperado aconteceu.")
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Voltar ao Dashboard" })
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Recarregar página" })
    );

    expect(redirectSpy).toHaveBeenCalledWith("/dashboard");
    expect(reloadSpy).toHaveBeenCalledTimes(1);
  });
});
