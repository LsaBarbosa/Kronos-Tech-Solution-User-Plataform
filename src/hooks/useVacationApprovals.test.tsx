import { renderHook, waitFor, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  approveVacationRequest,
  fetchVacationRequests,
  rejectVacationRequest,
} from "@/service/records.service";
import { useVacationApprovals } from "./useVacationApprovals";

const { toastSuccessMock, toastErrorMock } = vi.hoisted(() => ({
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: {
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}));

vi.mock("@/service/records.service", () => ({
  fetchVacationRequests: vi.fn(),
  approveVacationRequest: vi.fn(),
  rejectVacationRequest: vi.fn(),
}));

const mockFetchVacationRequests = vi.mocked(fetchVacationRequests);
const mockApproveVacationRequest = vi.mocked(approveVacationRequest);
const mockRejectVacationRequest = vi.mocked(rejectVacationRequest);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useVacationApprovals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchVacationRequests.mockResolvedValue([
      {
        employeeId: "emp-1",
        employeeName: "Maria",
        startDate: "10-04-2026",
        endDate: "12-04-2026",
        status: "PENDING",
        timeRecordIdsForApproval: [11, 12],
      },
    ] as any);
  });

  it("carrega solicitacoes de férias", async () => {
    const { result } = renderHook(
      () => useVacationApprovals({ page: 0, size: 10, status: "PENDING" } as any),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.requests).toHaveLength(1);
    });
  });

  it("aprova e rejeita férias", async () => {
    mockApproveVacationRequest.mockResolvedValue(undefined);
    mockRejectVacationRequest.mockResolvedValue(undefined);

    const { result } = renderHook(
      () => useVacationApprovals({ page: 0, size: 10, status: "PENDING" } as any),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.requests).toHaveLength(1);
    });

    await act(async () => {
      result.current.approve([11, 12]);
    });

    await act(async () => {
      result.current.reject([11, 12]);
    });

    expect(mockApproveVacationRequest).toHaveBeenCalledWith([11, 12]);
    expect(mockRejectVacationRequest).toHaveBeenCalledWith([11, 12]);
  });

  it("exibe mensagem de erro padronizada quando a aprovação falha", async () => {
    mockApproveVacationRequest.mockRejectedValue(new Error("Falha de rede"));

    const { result } = renderHook(
      () => useVacationApprovals({ page: 0, size: 10, status: "PENDING" } as any),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.requests).toHaveLength(1);
    });

    await act(async () => {
      result.current.approve([11, 12]);
    });

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalled();
    });
  });
});
