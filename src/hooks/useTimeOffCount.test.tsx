import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useTimeOffCount } from "./useTimeOffCount";
import * as RecordsService from "@/service/records.service";

vi.mock("@/service/records.service", () => ({
  listTimeOffRequests: vi.fn(),
}));

const mockListTimeOffRequests = vi.mocked(RecordsService.listTimeOffRequests);

const wrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe("useTimeOffCount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListTimeOffRequests.mockResolvedValue({
      totalElements: 6,
      totalPages: 1,
      currentPage: 0,
      isFirst: true,
      isLast: true,
    } as any);
  });

  it("retorna a contagem de abonos pendentes a partir do totalElements", async () => {
    const { result } = renderHook(() => useTimeOffCount(), { wrapper });

    await waitFor(() => {
      expect(result.current.pendingTimeOffCount).toBe(6);
    });

    expect(mockListTimeOffRequests).toHaveBeenCalledWith({
      page: 0,
      size: 1,
      employeeName: "",
      status: "PENDING",
    });
  });

  it("não consulta abonos pendentes quando o hook está desabilitado", async () => {
    const { result } = renderHook(() => useTimeOffCount(false), { wrapper });

    await waitFor(() => {
      expect(result.current.pendingTimeOffCount).toBe(0);
    });

    expect(mockListTimeOffRequests).not.toHaveBeenCalled();
  });
});
