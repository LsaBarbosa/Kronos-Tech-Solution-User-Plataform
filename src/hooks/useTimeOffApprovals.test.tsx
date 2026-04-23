import { renderHook, waitFor, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTimeOffApprovals } from "./useTimeOffApprovals";
import * as RecordsService from "@/service/records.service";

const toastMock = vi.fn();

vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));

vi.mock("@/service/records.service", () => ({
  listTimeOffRequests: vi.fn(),
  approveTimeOff: vi.fn(),
  rejectTimeOff: vi.fn(),
}));

const mockListTimeOffRequests = vi.mocked(RecordsService.listTimeOffRequests);
const mockApproveTimeOff = vi.mocked(RecordsService.approveTimeOff);
const mockRejectTimeOff = vi.mocked(RecordsService.rejectTimeOff);

const wrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe("useTimeOffApprovals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lista solicitações paginadas", async () => {
    mockListTimeOffRequests.mockResolvedValue({
      records: [
        {
          timeRecordId: 1,
          employeeData: { employeeName: "Maria" },
          startWork: "01-04-2026",
          endWork: "02-04-2026",
          startHour: "09:00",
          endHour: "18:00",
          hoursWork: "8h",
          statusRecord: "TIME_OFF_REQUEST",
          documentDownloadPath: null,
          employeeId: "emp-1",
        },
      ],
      page: 0,
      size: 5,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
      numberOfElements: 1,
      empty: false,
    } as any);

    const { result } = renderHook(() => useTimeOffApprovals(), { wrapper });

    await waitFor(() => {
      expect(result.current.approvalsData?.records).toHaveLength(1);
    });
  });

  it("aprova e invalida a lista", async () => {
    mockListTimeOffRequests.mockResolvedValue({
      records: [],
      page: 0,
      size: 5,
      totalElements: 0,
      totalPages: 1,
      first: true,
      last: true,
      numberOfElements: 0,
      empty: true,
    } as any);
    mockApproveTimeOff.mockResolvedValue(undefined);

    const { result } = renderHook(() => useTimeOffApprovals(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.handleAction(10, "approve");
    });

    expect(mockApproveTimeOff).toHaveBeenCalledWith(10);
  });

  it("rejeita uma solicitação", async () => {
    mockListTimeOffRequests.mockResolvedValue({
      records: [],
      page: 0,
      size: 5,
      totalElements: 0,
      totalPages: 1,
      first: true,
      last: true,
      numberOfElements: 0,
      empty: true,
    } as any);
    mockRejectTimeOff.mockResolvedValue(undefined);

    const { result } = renderHook(() => useTimeOffApprovals(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.handleAction(11, "reject");
    });

    expect(mockRejectTimeOff).toHaveBeenCalledWith(11);
  });
});
