import { renderHook, waitFor, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useToast } from "@/hooks/use-toast";
import {
  approveTimeRecordChange,
  fetchPendingApprovals,
  rejectTimeRecordChange,
} from "@/service/records.service";
import { usePendingApprovals } from "./usePendingApproval";

vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
  useToast: vi.fn(),
}));

vi.mock("@/service/records.service", () => ({
  fetchPendingApprovals: vi.fn(),
  approveTimeRecordChange: vi.fn(),
  rejectTimeRecordChange: vi.fn(),
}));

const mockUseToast = vi.mocked(useToast);
const mockFetchPendingApprovals = vi.mocked(fetchPendingApprovals);
const mockApproveTimeRecordChange = vi.mocked(approveTimeRecordChange);
const mockRejectTimeRecordChange = vi.mocked(rejectTimeRecordChange);
const toastMock = vi.fn();

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("usePendingApprovals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseToast.mockReturnValue({ toast: toastMock } as any);
    mockFetchPendingApprovals.mockResolvedValue({
      approvals: [
        {
          timeRecordId: 1,
          partnerName: "Maria",
          managerUsername: "gestor",
          newStartWork: "08:00",
          newEndWork: "18:00",
          currentStartWork: "09:00",
          currentEndWork: "17:00",
        },
      ],
      totalPages: 1,
      totalElements: 1,
      currentPage: 0,
      isFirst: true,
      isLast: true,
    } as any);
  });

  it("carrega aprovacoes pendentes", async () => {
    const { result } = renderHook(
      () => usePendingApprovals({ page: 0, employeeName: "Maria" }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.data?.approvals).toHaveLength(1);
    });
  });

  it("aprova e rejeita solicitacao", async () => {
    mockApproveTimeRecordChange.mockResolvedValue(undefined);
    mockRejectTimeRecordChange.mockResolvedValue(undefined);

    const { result } = renderHook(
      () => usePendingApprovals({ page: 0, employeeName: "" }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.data?.approvals).toHaveLength(1);
    });

    await act(async () => {
      result.current.approve(1);
    });

    await act(async () => {
      result.current.reject(1);
    });

    expect(mockApproveTimeRecordChange).toHaveBeenCalledWith(1);
    expect(mockRejectTimeRecordChange).toHaveBeenCalledWith(1);
  });
});
