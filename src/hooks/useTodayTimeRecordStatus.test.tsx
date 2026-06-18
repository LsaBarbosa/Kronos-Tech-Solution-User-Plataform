import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTodayTimeRecordStatus } from "./useTodayTimeRecordStatus";
import { fetchTodayTimeRecordStatus } from "@/service/records.service";

const checkinState = {
  status: "idle",
  lastAttemptAt: null as string | null,
};

vi.mock("@/service/records.service", () => ({
  fetchTodayTimeRecordStatus: vi.fn(),
}));

vi.mock("@/hooks/useCheckin", () => ({
  useCheckin: () => ({
    state: checkinState,
    openCheckin: vi.fn(),
  }),
}));

const mockFetchTodayTimeRecordStatus = vi.mocked(fetchTodayTimeRecordStatus);

describe("useTodayTimeRecordStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    checkinState.status = "idle";
    checkinState.lastAttemptAt = null;
  });

  it("carrega o status de hoje no mount", async () => {
    mockFetchTodayTimeRecordStatus.mockResolvedValue({
      date: "18-06-2026",
      status: "READY_TO_CHECKIN",
      nextAction: "CHECK_IN",
      lastRecordAt: null,
      lastRecordType: null,
      records: [],
      source: "PERSISTED",
      timezone: "America/Sao_Paulo",
    });

    const { result } = renderHook(() => useTodayTimeRecordStatus());

    await waitFor(() => {
      expect(result.current.todayStatus?.status).toBe("READY_TO_CHECKIN");
    });

    expect(result.current.isLoadingToday).toBe(false);
    expect(result.current.todayError).toBeNull();
  });

  it("expoe erro normalizado quando a consulta falha", async () => {
    mockFetchTodayTimeRecordStatus.mockRejectedValue(new Error("Falha de teste"));

    const { result } = renderHook(() => useTodayTimeRecordStatus());

    await waitFor(() => {
      expect(result.current.todayError).toBe("Falha de teste");
    });

    expect(result.current.todayStatus).toBeNull();
    expect(result.current.isLoadingToday).toBe(false);
  });

  it("refaz a consulta depois de um check-in bem-sucedido", async () => {
    mockFetchTodayTimeRecordStatus
      .mockResolvedValueOnce({
        date: "18-06-2026",
        status: "READY_TO_CHECKIN",
        nextAction: "CHECK_IN",
        lastRecordAt: null,
        lastRecordType: null,
        records: [],
        source: "PERSISTED",
        timezone: "America/Sao_Paulo",
      })
      .mockResolvedValueOnce({
        date: "18-06-2026",
        status: "READY_TO_CHECKOUT",
        nextAction: "CHECK_OUT",
        lastRecordAt: "2026-06-18T08:02:00-03:00",
        lastRecordType: "CHECK_IN",
        records: [
          {
            id: 1,
            actionType: "CHECK_IN",
            recordedAt: "2026-06-18T08:02:00-03:00",
            status: "CREATED",
            source: "BIOMETRIC",
          },
        ],
        source: "PERSISTED",
        timezone: "America/Sao_Paulo",
      });

    const { result, rerender } = renderHook(() => useTodayTimeRecordStatus());

    await waitFor(() => {
      expect(result.current.todayStatus?.status).toBe("READY_TO_CHECKIN");
    });

    checkinState.status = "success";
    checkinState.lastAttemptAt = "2026-06-18T08:03:00-03:00";
    rerender();

    await waitFor(() => {
      expect(mockFetchTodayTimeRecordStatus).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(result.current.todayStatus?.status).toBe("READY_TO_CHECKOUT");
    });
  });
});
