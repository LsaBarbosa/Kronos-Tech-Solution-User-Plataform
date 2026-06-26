import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Documentos from "./Documentos";
import { toast } from "@/hooks/use-toast";
import {
  deleteDocument,
  downloadDocument,
  fetchDocuments,
  fetchEmployeesForSelection,
} from "@/service/document.service";

vi.mock("@/components/Header", () => ({
  default: () => <div data-testid="header" />,
}));

vi.mock("@/components/Sidebar", () => ({
  default: () => <div data-testid="sidebar" />,
}));

vi.mock("@/components/faq/FaqContextualBlock", () => ({
  FaqContextualBlock: () => null,
}));

vi.mock("@/components/ui/select", async () => {
  const React = await import("react");

  const toText = (node: any): string =>
    React.Children.toArray(node)
      .map((child: any) => {
        if (typeof child === "string" || typeof child === "number") {
          return String(child);
        }

        if (React.isValidElement(child)) {
          return toText((child.props as { children?: React.ReactNode }).children);
        }

        return "";
      })
      .join("");

  const Select = ({ value, onValueChange, children }: any) => {
    const content = React.Children.toArray(children).find(
      (child: any) => React.isValidElement(child) && child.type === SelectContent
    ) as React.ReactElement | undefined;

    return React.createElement(
      "select",
      {
        role: "combobox",
        value: value ?? "",
        onChange: (event: React.ChangeEvent<HTMLSelectElement>) =>
          onValueChange?.(event.target.value),
      },
      content ? content.props.children : null
    );
  };

  const SelectContent = ({ children }: any) => React.createElement(React.Fragment, null, children);
  const SelectTrigger = ({ children }: any) => React.createElement(React.Fragment, null, children);
  const SelectValue = ({ placeholder }: any) => React.createElement(React.Fragment, null, placeholder);
  const SelectItem = ({ value, children }: any) =>
    React.createElement("option", { value }, toText(children));

  return {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  };
});

vi.mock("@/hooks/use-toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  useToast: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    status: "authenticated",
    role: "PARTNER",
    user: {
      account: {
        userId: "user-1",
        username: "maria",
        role: "PARTNER",
        active: true,
        employeeId: "emp-1",
      },
      profile: {
        employeeId: "emp-1",
        fullName: "Maria Silva",
      },
    },
  }),
}));

vi.mock("@/service/document.service", () => ({
  deleteDocument: vi.fn(),
  downloadDocument: vi.fn(),
  fetchDocuments: vi.fn(),
  fetchEmployeesForSelection: vi.fn(),
}));

const mockToast = vi.mocked(toast);
const mockFetchDocuments = vi.mocked(fetchDocuments);
const mockFetchEmployeesForSelection = vi.mocked(fetchEmployeesForSelection);
const mockDownloadDocument = vi.mocked(downloadDocument);
const mockDeleteDocument = vi.mocked(deleteDocument);

const makeJwt = (payload: Record<string, unknown>) => {
  const encoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  return `header.${encoded}.signature`;
};

describe("Documentos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem(
      "token",
      makeJwt({ role: "PARTNER", employeeId: "emp-1", fullName: "Maria Silva" })
    );
    mockFetchDocuments.mockResolvedValue([
      {
        id: "doc-1",
        name: "contracheque.pdf",
        createdAt: "2026-04-23T10:00:00Z",
        type: "PAYSLIP",
      },
    ] as any);
    mockFetchEmployeesForSelection.mockResolvedValue([] as any);
    mockDownloadDocument.mockResolvedValue({
      fileName: "contracheque.pdf",
      blob: new Blob(["conteudo"]),
    });
    mockDeleteDocument.mockResolvedValue(undefined);
  });

  const getPayslipChip = () =>
    screen.getByRole("radio", { name: /Contracheque/i });
  const getSearchButton = () =>
    screen.getByRole("button", { name: /Buscar documentos/i });

  it("bloqueia a busca sem tipo selecionado e depois carrega documentos", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Documentos />
      </MemoryRouter>
    );

    expect(getSearchButton()).toBeDisabled();

    await user.click(getPayslipChip());
    expect(getSearchButton()).toBeEnabled();

    await user.click(getSearchButton());

    await waitFor(() => {
      expect(mockFetchDocuments).toHaveBeenCalledWith({
        employeeId: "emp-1",
        type: "PAYSLIP",
      });
    });

    expect(screen.getByText("contracheque.pdf")).toBeInTheDocument();
    expect(mockToast.error).not.toHaveBeenCalled();
  });

  it("exibe erro ao falhar a busca", async () => {
    const user = userEvent.setup();
    mockFetchDocuments.mockRejectedValue(new Error("Falha na busca"));

    render(
      <MemoryRouter>
        <Documentos />
      </MemoryRouter>
    );

    await user.click(getPayslipChip());
    expect(getSearchButton()).toBeEnabled();
    await user.click(getSearchButton());

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Erro", {
        description: "Falha na busca",
        variant: "destructive",
      });
    });
  });
});
