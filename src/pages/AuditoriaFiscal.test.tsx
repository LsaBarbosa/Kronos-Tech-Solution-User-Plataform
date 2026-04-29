import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AuditoriaFiscal from "./AuditoriaFiscal";
import { useToast } from "@/hooks/use-toast";
import { FiscalService } from "@/service/fiscal.service";
import { normalizeHttpResponseError } from "@/service/helpers/service-error.helper";

const mockToast = vi.fn();

vi.mock("@/components/PageShell", () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: vi.fn(),
}));

vi.mock("@/service/fiscal.service", () => ({
  FiscalService: {
    downloadMirror: vi.fn(),
    downloadTechnicalCertificate: vi.fn(),
    downloadAfd: vi.fn(),
    downloadAej: vi.fn(),
  },
}));

const mockUseToast = vi.mocked(useToast);
const mockFiscalService = vi.mocked(FiscalService);

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void;

  const promise = new Promise<T>((res) => {
    resolve = res;
  });

  return { promise, resolve };
};

describe("AuditoriaFiscal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseToast.mockReturnValue({ toast: mockToast } as never);
  });

  it("desabilita o botão durante o download e bloqueia duplo clique", async () => {
    const user = userEvent.setup();
    const deferred = createDeferred<string>();

    mockFiscalService.downloadAej.mockReturnValue(deferred.promise);

    render(
      <MemoryRouter>
        <AuditoriaFiscal />
      </MemoryRouter>
    );

    const downloadButton = screen.getByRole("button", { name: "Baixar AEJ" });
    await user.click(downloadButton);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Gerando/i })).toBeDisabled();
    });

    await user.click(screen.getByRole("button", { name: /Gerando/i }));

    expect(mockFiscalService.downloadAej).toHaveBeenCalledTimes(1);

    deferred.resolve("AEJ_2026-04-01_2026-04-30.p7s");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Baixar AEJ" })).toBeEnabled();
    });
  });

  it("exibe mensagem amigavel quando o backend retorna 429", async () => {
    const user = userEvent.setup();

    mockFiscalService.downloadAej.mockRejectedValue(
      normalizeHttpResponseError(429)
    );

    render(
      <MemoryRouter>
        <AuditoriaFiscal />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "Baixar AEJ" }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Erro",
          variant: "destructive",
          description:
            "Processamento em andamento. Aguarde alguns instantes e tente novamente.",
        })
      );
    });
  });

  it("exibe mensagem amigavel quando o backend retorna 503", async () => {
    const user = userEvent.setup();

    mockFiscalService.downloadAej.mockRejectedValue(
      normalizeHttpResponseError(503)
    );

    render(
      <MemoryRouter>
        <AuditoriaFiscal />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "Baixar AEJ" }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Erro",
          variant: "destructive",
          description:
            "Serviço temporariamente indisponível. Tente novamente em instantes.",
        })
      );
    });
  });
});
