import type { ReactNode } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EspelhoPonto from "./EspelhoPonto";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { FiscalService } from "@/service/fiscal.service";
import { fetchReportEmployees } from "@/service/records.service";
import { normalizeHttpResponseError } from "@/service/helpers/service-error.helper";
import type { Employee } from "@/utils/report-utils";

const mockToast = vi.fn();

vi.mock("@/components/PageShell", () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/faq/FaqContextualBlock", () => ({
  FaqContextualBlock: () => null,
}));

vi.mock("@/components/ui/select", async () => {
  const React = await import("react");

  type SelectContentProps = {
    children?: ReactNode;
  };

  function SelectContent({ children }: SelectContentProps) {
    return <>{children}</>;
  }

  type SelectProps = {
    value?: string;
    onValueChange?: (value: string) => void;
    children?: ReactNode;
    disabled?: boolean;
  };

  function Select({ value, onValueChange, children, disabled }: SelectProps) {
    const options = React.Children.toArray(children).flatMap((child) => {
      if (React.isValidElement<SelectContentProps>(child) && child.type === SelectContent) {
        return React.Children.toArray(child.props.children);
      }

      return [];
    });

    return (
      <select
        role="combobox"
        value={value ?? ""}
        disabled={disabled}
        onChange={(event) => onValueChange?.(event.target.value)}
      >
        {options}
      </select>
    );
  }

  type SelectItemProps = {
    value: string;
    children?: ReactNode;
  };

  function SelectItem({ value, children }: SelectItemProps) {
    return <option value={value}>{children}</option>;
  }

  function SelectTrigger({ children }: { children?: ReactNode }) {
    return <>{children}</>;
  }

  function SelectValue({ placeholder }: { placeholder?: ReactNode }) {
    return <>{placeholder}</>;
  }

  return {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  };
});

vi.mock("@/hooks/use-toast", () => ({
  useToast: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/service/fiscal.service", () => ({
  FiscalService: {
    downloadMirror: vi.fn(),
    downloadTechnicalCertificate: vi.fn(),
    downloadAfd: vi.fn(),
    downloadAej: vi.fn(),
  },
}));

vi.mock("@/service/records.service", () => ({
  fetchReportEmployees: vi.fn(),
}));

const mockUseToast = vi.mocked(useToast);
const mockUseAuth = vi.mocked(useAuth);
const mockFiscalService = vi.mocked(FiscalService);
const mockFetchReportEmployees = vi.mocked(fetchReportEmployees);

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void;

  const promise = new Promise<T>((res) => {
    resolve = res;
  });

  return { promise, resolve };
};

const authState = (role: string) => ({
  status: "authenticated" as const,
  user: null,
  role,
  token: "token",
  isAuthenticated: true,
  checkSession: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
});

describe("EspelhoPonto", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseToast.mockReturnValue({ toast: mockToast } as never);
  });

  it("não exibe seletor para PARTNER e baixa o espelho próprio sem targetEmployeeId", async () => {
    const user = userEvent.setup();
    const deferred = createDeferred<string>();

    mockUseAuth.mockReturnValue(authState("PARTNER") as never);
    mockFiscalService.downloadMirror.mockReturnValue(deferred.promise);

    render(
      <MemoryRouter>
        <EspelhoPonto />
      </MemoryRouter>
    );

    expect(screen.queryByText("Colaborador")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Baixar PDF" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Processando/i })).toBeDisabled();
    });

    await user.click(screen.getByRole("button", { name: /Processando/i }));

    expect(mockFiscalService.downloadMirror).toHaveBeenCalledTimes(1);
    expect(mockFiscalService.downloadMirror).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      undefined
    );

    await act(async () => {
      deferred.resolve("Espelho_2026-04-01_2026-04-30.pdf");
    });
  });

  it("exibe seletor para MANAGER e envia targetEmployeeId selecionado", async () => {
    const user = userEvent.setup();
    const employees: Employee[] = [
      {
        employeeId: "emp-2",
        fullName: "João Gestor",
      },
    ];

    mockUseAuth.mockReturnValue(authState("MANAGER") as never);
    mockFetchReportEmployees.mockResolvedValue(employees);
    mockFiscalService.downloadMirror.mockResolvedValue("Espelho_2026-04.pdf");

    render(
      <MemoryRouter>
        <EspelhoPonto />
      </MemoryRouter>
    );

    expect(await screen.findByText("Colaborador")).toBeInTheDocument();
    expect(await screen.findByRole("option", { name: "João Gestor" })).toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox"), "emp-2");
    await user.click(screen.getByRole("button", { name: "Baixar PDF" }));

    await waitFor(() => {
      expect(mockFiscalService.downloadMirror).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        "emp-2"
      );
    });

    expect(mockFiscalService.downloadMirror.mock.calls[0]).toHaveLength(3);
  });

  it("desabilita o botão durante o download e bloqueia duplo clique", async () => {
    const user = userEvent.setup();
    const deferred = createDeferred<string>();

    mockUseAuth.mockReturnValue(authState("PARTNER") as never);
    mockFiscalService.downloadMirror.mockReturnValue(deferred.promise);

    render(
      <MemoryRouter>
        <EspelhoPonto />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "Baixar PDF" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Processando/i })).toBeDisabled();
    });

    await user.click(screen.getByRole("button", { name: /Processando/i }));

    expect(mockFiscalService.downloadMirror).toHaveBeenCalledTimes(1);

    await act(async () => {
      deferred.resolve("Espelho_2026-04-01_2026-04-30.pdf");
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Baixar PDF" })).toBeEnabled();
    });
  });

  it("exibe mensagem amigavel quando o backend retorna 503", async () => {
    const user = userEvent.setup();

    mockUseAuth.mockReturnValue(authState("PARTNER") as never);
    mockFiscalService.downloadMirror.mockRejectedValue(
      normalizeHttpResponseError(503)
    );

    render(
      <MemoryRouter>
        <EspelhoPonto />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "Baixar PDF" }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Erro no Download",
          variant: "destructive",
          description:
            "Serviço temporariamente indisponível. Tente novamente em instantes.",
        })
      );
    });
  });
});
