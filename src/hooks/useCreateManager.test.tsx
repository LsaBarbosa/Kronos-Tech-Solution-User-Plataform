import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCreateManager } from "./useCreateManager";
import { useToast } from "@/hooks/use-toast";
import { fetchCompanyList } from "@/service/company.service";
import {
  checkCpfAvailability,
  checkUsernameAvailability,
  createManager,
  createUser,
} from "@/service/collaborator-management.service";

vi.mock("@/service/company.service", () => ({
  fetchCompanyList: vi.fn(),
}));

vi.mock("@/service/collaborator-management.service", () => ({
  checkCpfAvailability: vi.fn(),
  checkUsernameAvailability: vi.fn(),
  createManager: vi.fn(),
  createUser: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: vi.fn(),
}));

const mockFetchCompanyList = vi.mocked(fetchCompanyList);
const mockUseToast = vi.mocked(useToast);
const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("useCreateManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseToast.mockReturnValue({ toast: vi.fn() } as never);
    mockFetchCompanyList.mockResolvedValue([
      { id: "cmp-1", name: "Kronos Tech" } as any,
    ]);
  });

  it("carrega empresas e inicia como MANAGER", async () => {
    const { result } = renderHook(() => useCreateManager(), { wrapper });

    await waitFor(() => expect(result.current.isFetchingCompanies).toBe(false));

    expect(result.current.companies).toEqual([
      { companyId: "cmp-1", name: "Kronos Tech" },
    ]);
    expect(result.current.form.getValues("role")).toBe("MANAGER");
  });
});
