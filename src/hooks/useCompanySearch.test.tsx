import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCompanySearch } from "./useCompanySearch";
import {
  fetchCompanyDetails,
  fetchCompanyList,
  toggleCompanyStatus,
  updateCompany,
} from "@/service/company.service";

const toastMock = vi.fn();
const navigateMock = vi.fn();

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("@/service/company.service", () => ({
  fetchCompanyList: vi.fn(),
  fetchCompanyDetails: vi.fn(),
  updateCompany: vi.fn(),
  toggleCompanyStatus: vi.fn(),
  formatCNPJ: (value: string) => value,
  formatCEP: (value: string) => value,
  cleanCEP: (value: string) => value.replace(/\D/g, ""),
}));

const mockFetchCompanyList = vi.mocked(fetchCompanyList);
const mockFetchCompanyDetails = vi.mocked(fetchCompanyDetails);
const mockUpdateCompany = vi.mocked(updateCompany);
const mockToggleCompanyStatus = vi.mocked(toggleCompanyStatus);

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("useCompanySearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockFetchCompanyList.mockResolvedValue([
      {
        id: "company-1",
        name: "Kronos Tech",
        cnpj: "12345678000199",
        email: "contato@kronos.com",
        active: true,
        address: {
          postalCode: "01001000",
          number: "100",
          street: "Rua A",
          city: "São Paulo",
          state: "SP",
        },
      },
    ] as any);

    mockFetchCompanyDetails.mockResolvedValue({
      id: "company-1",
      name: "Kronos Tech",
      cnpj: "12345678000199",
      email: "contato@kronos.com",
      active: true,
      activeEmployees: 4,
      inactiveEmployees: 1,
      address: {
        postalCode: "01001000",
        number: "100",
        street: "Rua A",
        city: "São Paulo",
        state: "SP",
        neighborhood: "Centro",
      },
      location: {
        latitude: -23.55052,
        longitude: -46.633308,
      },
    } as any);

    mockUpdateCompany.mockResolvedValue(undefined);
    mockToggleCompanyStatus.mockResolvedValue(undefined);
  });

  it("busca o detalhe real da empresa ao editar e atualiza o payload correto", async () => {
    const { result } = renderHook(() => useCompanySearch(), { wrapper });

    await waitFor(() => {
      expect(result.current.empresas).toHaveLength(1);
    });

    await act(async () => {
      await result.current.handleEditEmpresa(result.current.empresas[0]);
    });

    await waitFor(() => {
      expect(result.current.editingEmpresa?.cnpj).toBe("12345678000199");
    });

    expect(mockFetchCompanyDetails).toHaveBeenCalledWith("12345678000199");
    expect(result.current.editForm.getValues("name")).toBe("Kronos Tech");

    await act(async () => {
      result.current.editForm.setValue("name", "Kronos Atualizada");
      result.current.editForm.setValue("email", "novo@kronos.com");
      result.current.editForm.setValue("active", true);
      result.current.editForm.setValue("address.postalCode", "01311000");
      result.current.editForm.setValue("address.number", "200");
    });

    await act(async () => {
      await result.current.onSubmitEdit({
        name: "Kronos Atualizada",
        email: "novo@kronos.com",
        active: true,
        address: {
          postalCode: "01311000",
          number: "200",
        },
      });
    });

    expect(mockUpdateCompany).toHaveBeenCalledWith(
      "12345678000199",
      expect.objectContaining({
        name: "Kronos Atualizada",
        email: "novo@kronos.com",
        active: true,
        address: {
          postalCode: "01311000",
          number: "200",
        },
        location: {
          latitude: -23.55052,
          longitude: -46.633308,
        },
      })
    );
  });

  it("alterna o status da empresa com o contrato atual do service", async () => {
    const { result } = renderHook(() => useCompanySearch(), { wrapper });

    await waitFor(() => {
      expect(result.current.empresas).toHaveLength(1);
    });

    await act(async () => {
      await result.current.handleToggleStatus(result.current.empresas[0]);
    });

    expect(mockToggleCompanyStatus).toHaveBeenCalledWith("12345678000199");
  });
});
