import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchPendingVacationCount } from "@/service/records.service";
import { useVacationCount } from "./useVacationCount";

vi.mock("@/service/records.service", () => ({
  fetchPendingVacationCount: vi.fn(),
}));

const mockFetchPendingVacationCount = vi.mocked(fetchPendingVacationCount);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useVacationCount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("expõe a contagem de férias pendentes do service", async () => {
    mockFetchPendingVacationCount.mockResolvedValue(4);

    const { result } = renderHook(() => useVacationCount(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.pendingVacationCount).toBe(4);
    });

    expect(mockFetchPendingVacationCount).toHaveBeenCalledTimes(1);
  });
});
