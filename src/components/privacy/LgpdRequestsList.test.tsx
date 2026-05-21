import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LgpdRequestsList from "./LgpdRequestsList";
import type { LgpdRequestResponse } from "@/service/lgpd.service";

const lgpdMocks = vi.hoisted(() => ({
  listLgpdRequests: vi.fn(),
}));

vi.mock("@/service/lgpd.service", () => ({
  listLgpdRequests: lgpdMocks.listLgpdRequests,
}));

describe("LgpdRequestsList", () => {
  beforeEach(() => {
    lgpdMocks.listLgpdRequests.mockReset();
  });

  it("renderiza lista de solicitações com sucesso", async () => {
    const mockRequests: LgpdRequestResponse[] = [
      {
        requestId: "req-001",
        requestType: "ACCESS",
        status: "OPEN",
        description: "Solicitação de acesso aos dados",
        openedAt: "2026-05-21T10:00:00Z",
        closedAt: null,
      },
      {
        requestId: "req-002",
        requestType: "DELETION",
        status: "COMPLETED",
        description: "Solicitação de exclusão de dados",
        openedAt: "2026-05-20T10:00:00Z",
        closedAt: "2026-05-21T15:00:00Z",
      },
    ];

    lgpdMocks.listLgpdRequests.mockResolvedValue(mockRequests);

    render(<LgpdRequestsList refreshKey={0} />);

    await waitFor(() => {
      expect(screen.getByText("Acesso aos meus dados")).toBeInTheDocument();
    });

    expect(screen.getByText("Exclusão de dados")).toBeInTheDocument();
    expect(screen.getByText("Aberto")).toBeInTheDocument();
    expect(screen.getByText("Concluído")).toBeInTheDocument();
  });

  it("exibe mensagem quando lista está vazia", async () => {
    lgpdMocks.listLgpdRequests.mockResolvedValue([]);

    render(<LgpdRequestsList refreshKey={0} />);

    await waitFor(() => {
      expect(
        screen.getByText(/Nenhuma solicitação encontrada/)
      ).toBeInTheDocument();
    });
  });

  it("recarrega lista quando refreshKey muda", async () => {
    const mockRequests: LgpdRequestResponse[] = [
      {
        requestId: "req-001",
        requestType: "ACCESS",
        status: "OPEN",
        description: "Teste",
        openedAt: "2026-05-21T10:00:00Z",
        closedAt: null,
      },
    ];

    lgpdMocks.listLgpdRequests.mockResolvedValue(mockRequests);

    const { rerender } = render(<LgpdRequestsList refreshKey={0} />);

    await waitFor(() => {
      expect(lgpdMocks.listLgpdRequests).toHaveBeenCalledTimes(1);
    });

    rerender(<LgpdRequestsList refreshKey={1} />);

    await waitFor(() => {
      expect(lgpdMocks.listLgpdRequests).toHaveBeenCalledTimes(2);
    });
  });

  it("exibe title e description", () => {
    lgpdMocks.listLgpdRequests.mockResolvedValue([]);

    render(<LgpdRequestsList refreshKey={0} />);

    expect(screen.getByText("Minhas Solicitações LGPD")).toBeInTheDocument();
    expect(
      screen.getByText("Acompanhe o status de suas solicitações")
    ).toBeInTheDocument();
  });
});
