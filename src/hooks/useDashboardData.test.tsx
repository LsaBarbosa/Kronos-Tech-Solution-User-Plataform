import { act, renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDashboardData } from "./useDashboardData";
import {
  fetchAllWarnings,
  fetchPendingApprovalsCount,
  fetchUserProfile,
  updateLastSeenMessageTimestamp,
} from "@/service/dashboard.service";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("@/lib/feedback", () => ({
  showErrorToast: vi.fn(),
}));

vi.mock("@/service/dashboard.service", () => ({
  fetchUserProfile: vi.fn(),
  fetchPendingApprovalsCount: vi.fn(),
  fetchAllWarnings: vi.fn(),
  updateLastSeenMessageTimestamp: vi.fn(),
}));

const mockFetchUserProfile = vi.mocked(fetchUserProfile);
const mockFetchPendingApprovalsCount = vi.mocked(fetchPendingApprovalsCount);
const mockFetchAllWarnings = vi.mocked(fetchAllWarnings);
const mockUpdateLastSeenMessageTimestamp = vi.mocked(updateLastSeenMessageTimestamp);

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("useDashboardData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigateMock.mockClear();
  });

  it("carrega perfil, aprovações e avisos em um único contrato", async () => {
    mockFetchUserProfile.mockResolvedValue({
      userId: "u-1",
      username: "maria",
      role: "MANAGER",
      active: true,
      employeeId: "emp-1",
      fullName: "Maria Silva",
    } as never);
    mockFetchPendingApprovalsCount.mockResolvedValue({ totalElements: 4 } as never);
    mockFetchAllWarnings.mockResolvedValue([
      {
        messageId: "msg-1",
        createdAt: new Date().toISOString(),
        title: "Aviso",
        priority: "high",
      },
    ] as never);

    const { result } = renderHook(() => useDashboardData(), { wrapper });

    await waitFor(() => {
      expect(mockFetchUserProfile).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(result.current.userData?.role).toBe("MANAGER");
    });

    expect(result.current.userData?.role).toBe("MANAGER");
    expect(result.current.pendingApprovalsCount).toBe(4);
    expect(result.current.hasApprovalPermission).toBe(true);
    expect(result.current.newWarnings).toHaveLength(1);
  });

  it("atualiza o timestamp ao abrir avisos", async () => {
    mockFetchUserProfile.mockResolvedValue({
      userId: "u-1",
      username: "maria",
      role: "MANAGER",
      active: true,
      employeeId: "emp-1",
      fullName: "Maria Silva",
    } as never);
    mockFetchPendingApprovalsCount.mockResolvedValue({ totalElements: 0 } as never);
    mockFetchAllWarnings.mockResolvedValue([
      {
        messageId: "msg-1",
        createdAt: new Date().toISOString(),
        title: "Aviso",
        priority: "high",
      },
    ] as never);
    mockUpdateLastSeenMessageTimestamp.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDashboardData(), { wrapper });

    await waitFor(() => {
      expect(result.current.newWarnings).toHaveLength(1);
    });

    await act(async () => {
      await result.current.handleWarningClick();
    });

    expect(mockUpdateLastSeenMessageTimestamp).toHaveBeenCalledTimes(1);
  });

  it("não consulta aprovações pendentes para partner", async () => {
    mockFetchUserProfile.mockResolvedValue({
      userId: "u-2",
      username: "joao",
      role: "PARTNER",
      active: true,
      employeeId: "emp-2",
      fullName: "Joao Silva",
    } as never);
    mockFetchAllWarnings.mockResolvedValue([] as never);

    const { result } = renderHook(() => useDashboardData(), { wrapper });

    await waitFor(() => {
      expect(result.current.userData?.role).toBe("PARTNER");
    });

    expect(mockFetchPendingApprovalsCount).not.toHaveBeenCalled();
    expect(result.current.pendingApprovalsCount).toBe(0);
    expect(result.current.hasApprovalPermission).toBe(false);
  });
});
