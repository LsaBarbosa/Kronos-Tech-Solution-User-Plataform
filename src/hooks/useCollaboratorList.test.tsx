import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCollaboratorList } from "./useCollaboratorList";
import { fetchEmployeeList, toggleUserStatus, updateCollaborator, updateUser } from "@/service/collaborator-management.service";
import { listUsers } from "@/service/user.service";
import { useToast } from "@/hooks/use-toast";

vi.mock("@/hooks/use-toast", () => ({
  useToast: vi.fn(),
}));

vi.mock("@/service/collaborator-management.service", () => ({
  fetchEmployeeList: vi.fn(),
  toggleUserStatus: vi.fn(),
  updateCollaborator: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock("@/service/user.service", () => ({
  listUsers: vi.fn(),
}));

const mockUseToast = vi.mocked(useToast);
const mockFetchEmployeeList = vi.mocked(fetchEmployeeList);
const mockToggleUserStatus = vi.mocked(toggleUserStatus);
const mockUpdateCollaborator = vi.mocked(updateCollaborator);
const mockUpdateUser = vi.mocked(updateUser);
const mockListUsers = vi.mocked(listUsers);

const employee = {
  employeeId: "emp-1",
  fullName: "Colaborador Base",
  username: "base.user",
  maskedCpf: "12345678901",
  pis: "12345678901",
  jobPosition: "Analista",
  email: "base@example.com",
  salary: 3500,
  phone: "11999999999",
  address: {
    street: "Rua A",
    number: "10",
    postalCode: "01001000",
    city: "São Paulo",
    state: "SP",
  },
  companyId: "cmp-1",
  active: true,
  homeOffice: false,
  workStartTime: "08:00",
  workEndTime: "17:00",
  breakStartTime: "12:00",
  breakEndTime: "13:00",
  scheduleType: "TRADITIONAL_5X2",
  scaleStartDate: "2026-01-01",
  preferredDayOff: "MONDAY",
  weekendOffIndex: 0,
  fixedWorkDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
};

const user = {
  userId: "user-1",
  employeeId: "emp-1",
  username: "base.user",
  role: "PARTNER" as const,
  active: true,
};

describe("useCollaboratorList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseToast.mockReturnValue({
      toast: vi.fn(),
    } as never);

    mockFetchEmployeeList.mockResolvedValue([employee] as never);
    mockListUsers.mockResolvedValue([user] as never);
    mockToggleUserStatus.mockResolvedValue(undefined as never);
    mockUpdateCollaborator.mockResolvedValue(undefined as never);
    mockUpdateUser.mockResolvedValue(undefined as never);
  });

  it("atualiza colaborador e usuario com os contratos corretos", async () => {
    const { result } = renderHook(() => useCollaboratorList());

    await waitFor(() => expect(result.current.colaboradores).toHaveLength(1));

    act(() => {
      result.current.handleEditColaborador(result.current.colaboradores[0]);
    });

    act(() => {
      result.current.handleEditedDataChange("fullName", "Colaborador Atualizado");
      result.current.handleEditedDataChange("username", "novo.usuario");
      result.current.handleEditedDataChange("role", "MANAGER");
      result.current.handleEditedDataChange("enabled", false);
    });

    await act(async () => {
      await result.current.handleSaveColaborador("emp-1");
    });

    expect(mockUpdateCollaborator).toHaveBeenCalledWith(
      "emp-1",
      expect.objectContaining({
        fullName: "Colaborador Atualizado",
      })
    );
    expect(mockUpdateUser).toHaveBeenCalledWith("user-1", {
      username: "novo.usuario",
      role: "MANAGER",
      enabled: false,
    });
  });

  it("alterna status do usuario e refaz o carregamento", async () => {
    const { result } = renderHook(() => useCollaboratorList());

    await waitFor(() => expect(result.current.colaboradores).toHaveLength(1));

    await act(async () => {
      await result.current.handleToggleUserStatus("user-1", true);
    });

    expect(mockToggleUserStatus).toHaveBeenCalledWith("user-1");
    await waitFor(() => expect(mockFetchEmployeeList).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(mockListUsers).toHaveBeenCalledTimes(2));
  });

  it("vincula colaborador ao usuario pelo employeeId retornado em /users/search", async () => {
    mockFetchEmployeeList.mockResolvedValue([employee] as never);

    mockListUsers.mockResolvedValue([
      {
        userId: "user-99",
        employeeId: "emp-1",
        username: "different.username",
        role: "MANAGER" as const,
        active: false,
      },
    ] as never);

    const { result } = renderHook(() => useCollaboratorList());

    await waitFor(() => expect(result.current.colaboradores).toHaveLength(1));

    expect(result.current.colaboradores[0]).toMatchObject({
      employeeId: "emp-1",
      userId: "user-99",
      username: "different.username",
      role: "MANAGER",
      enabled: false,
    });
  });
});
