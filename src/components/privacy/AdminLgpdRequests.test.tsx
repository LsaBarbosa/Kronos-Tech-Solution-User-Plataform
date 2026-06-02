import type { ReactNode } from "react";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { APP_PATHS } from "@/config/app-routes";
import { AdminLgpdRequests } from "./AdminLgpdRequests";

const listAdminRequestsMock = vi.hoisted(() => vi.fn());

vi.mock("@/service/lgpd.service", () => ({
  listAdminRequests: listAdminRequestsMock,
}));

vi.mock("@/components/layout/AuthenticatedPageLayout", () => ({
  AuthenticatedPageLayout: ({ children }: { children: ReactNode }) => (
    <div>
      <header>Mock Header</header>
      <aside>Mock Sidebar</aside>
      {children}
    </div>
  ),
}));

vi.mock("@/components/ui/select", () => {
  const SelectContext = React.createContext<{
    onValueChange?: (value: string) => void;
    value?: string;
  } | null>(null);

  return {
    Select: ({
      value,
      onValueChange,
      children,
    }: {
      value?: string;
      onValueChange?: (value: string) => void;
      children?: ReactNode;
    }) => (
      <SelectContext.Provider value={{ value, onValueChange }}>
        <div data-select-value={value}>{children}</div>
      </SelectContext.Provider>
    ),
    SelectContent: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    SelectItem: ({ value, children }: { value: string; children?: ReactNode }) => {
      if (value === "") {
        throw new Error("SelectItem value must not be empty");
      }

      const context = React.useContext(SelectContext);

      return (
        <button
          type="button"
          data-value={value}
          onClick={() => context?.onValueChange?.(value)}
        >
          {children}
        </button>
      );
    },
    SelectTrigger: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
  };
});

const emptyPage = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  size: 10,
};

const sampleRequest = {
  requestId: "2a56db47-3817-44e7-9f92-f25aa8b745fa",
  employeeFullName: "Maria Souza",
  companyName: "Padaria Exemplo LTDA",
  type: "ACCESS",
  status: "OPEN",
  createdAt: "2026-06-01T18:20:35.123Z",
  assignedToName: null,
  updatedAt: "2026-06-01T18:20:35.123Z",
  isOverdue: false,
};

const LocationProbe = () => {
  const location = useLocation();

  return <div data-testid="location-probe">{location.pathname}</div>;
};

const renderAdminRequests = () =>
  render(
    <MemoryRouter initialEntries={[APP_PATHS.lgpdAdminRequests]}>
      <Routes>
        <Route path={APP_PATHS.lgpdAdminRequests} element={<AdminLgpdRequests />} />
        <Route path={APP_PATHS.lgpdAdminRequestDetails} element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );

describe("AdminLgpdRequests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listAdminRequestsMock.mockResolvedValue(emptyPage);
  });

  it("renders the loading state initially", () => {
    listAdminRequestsMock.mockImplementation(() => new Promise(() => {}));

    const { container } = renderAdminRequests();

    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders the empty state when there are no requests", async () => {
    renderAdminRequests();

    expect(await screen.findByText("Nenhuma solicitação encontrada")).toBeInTheDocument();
  });

  it("renders the authenticated Header and Sidebar", async () => {
    renderAdminRequests();

    expect(await screen.findByText("Mock Header")).toBeInTheDocument();
    expect(screen.getByText("Mock Sidebar")).toBeInTheDocument();
  });

  it("renders the requests table with fallback values", async () => {
    listAdminRequestsMock.mockResolvedValue({
      ...emptyPage,
      content: [sampleRequest],
      totalElements: 1,
      totalPages: 1,
    });

    renderAdminRequests();

    expect(await screen.findByText("Maria Souza")).toBeInTheDocument();
    expect(screen.getByText("Padaria Exemplo LTDA")).toBeInTheDocument();
    expect(screen.getAllByText("Acesso aos meus dados").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Aberto").length).toBeGreaterThan(0);
    expect(screen.getByText("01/06/2026")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("does not break when createdAt is invalid", async () => {
    listAdminRequestsMock.mockResolvedValue({
      ...emptyPage,
      content: [{ ...sampleRequest, createdAt: "invalid-date" }],
    });

    renderAdminRequests();

    expect(await screen.findByText("Maria Souza")).toBeInTheDocument();
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("renders unknown request types as their raw value", async () => {
    listAdminRequestsMock.mockResolvedValue({
      ...emptyPage,
      content: [{ ...sampleRequest, type: "UNKNOWN_TYPE" }],
    });

    renderAdminRequests();

    expect(await screen.findByText("UNKNOWN_TYPE")).toBeInTheDocument();
  });

  it("does not render SelectItem with an empty value", async () => {
    renderAdminRequests();

    await screen.findByText("Nenhuma solicitação encontrada");

    expect(document.querySelector('[data-value=""]')).not.toBeInTheDocument();
  });

  it("removes the type filter when selecting all request types", async () => {
    const user = userEvent.setup();

    renderAdminRequests();
    await screen.findByText("Nenhuma solicitação encontrada");

    await user.click(screen.getByRole("button", { name: "Acesso aos meus dados" }));
    await waitFor(() => {
      expect(listAdminRequestsMock).toHaveBeenLastCalledWith(0, 10, "ACCESS", undefined, undefined);
    });

    await user.click(screen.getByRole("button", { name: "Todas as Solicitações" }));
    await waitFor(() => {
      expect(listAdminRequestsMock).toHaveBeenLastCalledWith(0, 10, undefined, undefined, undefined);
    });
  });

  it("removes the status filter when selecting all statuses", async () => {
    const user = userEvent.setup();

    renderAdminRequests();
    await screen.findByText("Nenhuma solicitação encontrada");

    await user.click(screen.getByRole("button", { name: "Aberto" }));
    await waitFor(() => {
      expect(listAdminRequestsMock).toHaveBeenLastCalledWith(0, 10, undefined, "OPEN", undefined);
    });

    await user.click(screen.getByRole("button", { name: "Todos os Status" }));
    await waitFor(() => {
      expect(listAdminRequestsMock).toHaveBeenLastCalledWith(0, 10, undefined, undefined, undefined);
    });
  });

  it("navigates to the request details page when the row is clicked", async () => {
    const user = userEvent.setup();
    listAdminRequestsMock.mockResolvedValue({
      ...emptyPage,
      content: [sampleRequest],
      totalElements: 1,
      totalPages: 1,
    });

    renderAdminRequests();

    await user.click(
      await screen.findByRole("button", {
        name: /Abrir detalhes da solicitação de Maria Souza/i,
      })
    );

    expect(screen.getByTestId("location-probe")).toHaveTextContent(
      "/lgpd/admin/requests/2a56db47-3817-44e7-9f92-f25aa8b745fa"
    );
  });

  it("navigates to the request details page when the action is clicked", async () => {
    const user = userEvent.setup();
    const stopPropagationSpy = vi.spyOn(Event.prototype, "stopPropagation");
    listAdminRequestsMock.mockResolvedValue({
      ...emptyPage,
      content: [sampleRequest],
      totalElements: 1,
      totalPages: 1,
    });

    renderAdminRequests();

    await user.click(
      await screen.findByRole("button", {
        name: /Abrir detalhes da solicitação 2a56db47-3817-44e7-9f92-f25aa8b745fa/i,
      })
    );

    expect(screen.getByTestId("location-probe")).toHaveTextContent(
      "/lgpd/admin/requests/2a56db47-3817-44e7-9f92-f25aa8b745fa"
    );
    expect(stopPropagationSpy).toHaveBeenCalled();

    stopPropagationSpy.mockRestore();
  });

  it("navigates to the request details page when pressing Enter on the row", async () => {
    const user = userEvent.setup();
    listAdminRequestsMock.mockResolvedValue({
      ...emptyPage,
      content: [sampleRequest],
      totalElements: 1,
      totalPages: 1,
    });

    renderAdminRequests();

    const row = await screen.findByRole("button", {
      name: /Abrir detalhes da solicitação de Maria Souza/i,
    });
    row.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByTestId("location-probe")).toHaveTextContent(
      "/lgpd/admin/requests/2a56db47-3817-44e7-9f92-f25aa8b745fa"
    );
  });

  it("navigates to the request details page when pressing Space on the row", async () => {
    const user = userEvent.setup();
    listAdminRequestsMock.mockResolvedValue({
      ...emptyPage,
      content: [sampleRequest],
      totalElements: 1,
      totalPages: 1,
    });

    renderAdminRequests();

    const row = await screen.findByRole("button", {
      name: /Abrir detalhes da solicitação de Maria Souza/i,
    });
    row.focus();
    await user.keyboard(" ");

    expect(screen.getByTestId("location-probe")).toHaveTextContent(
      "/lgpd/admin/requests/2a56db47-3817-44e7-9f92-f25aa8b745fa"
    );
  });
});
