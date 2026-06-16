import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { CheckinProvider } from "@/context/CheckinContext";
import PageShell from "./PageShell";

vi.mock("@/components/Header", () => ({
  default: () => <div data-testid="header" />,
}));

const renderPageShell = (path: string) =>
  render(
    <CheckinProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route
            path="*"
            element={
              <PageShell>
                <div>Conteudo</div>
              </PageShell>
            }
          />
        </Routes>
      </MemoryRouter>
    </CheckinProvider>
  );

describe("PageShell", () => {
  it("renderiza a estrutura base com header e conteúdo", () => {
    renderPageShell("/lista-colaboradores");

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByText("Conteudo")).toBeInTheDocument();
  });
});
