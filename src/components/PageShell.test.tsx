import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import PageShell from "./PageShell";

vi.mock("@/components/Header", () => ({
  default: () => <div data-testid="header" />,
}));

vi.mock("@/components/Sidebar", () => ({
  default: () => <div data-testid="sidebar" />,
}));

const renderPageShell = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="*"
          element={
            <PageShell sidebarOpen={false} toggleSidebar={() => undefined}>
              <div>Conteudo</div>
            </PageShell>
          }
        />
      </Routes>
    </MemoryRouter>
  );

describe("PageShell", () => {
  it("renderiza breadcrumbs a partir da metadata centralizada", () => {
    renderPageShell("/lista-colaboradores");

    expect(screen.getByLabelText("Breadcrumb")).toBeInTheDocument();
    expect(screen.getByText("Início")).toBeInTheDocument();
    expect(screen.getByText("Colaboradores")).toBeInTheDocument();
  });
});
