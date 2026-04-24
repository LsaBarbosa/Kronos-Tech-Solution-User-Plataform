import { renderHook, waitFor, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUpdateCompanyForm } from "./useUpdateCompanyForm";
import {
  fetchCompanyList,
  fetchCompanyDetails,
  updateCompany,
  getGeolocationFromCEP,
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
  getGeolocationFromCEP: vi.fn(),
  formatCNPJ: (value: string) => value,
  cleanCEP: (value: string) => value.replace(/\D/g, ""),
}));

const mockFetchCompanyList = vi.mocked(fetchCompanyList);
const mockFetchCompanyDetails = vi.mocked(fetchCompanyDetails);
const mockUpdateCompany = vi.mocked(updateCompany);
const mockGetGeolocationFromCEP = vi.mocked(getGeolocationFromCEP);

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("useUpdateCompanyForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchCompanyList.mockResolvedValue([
      {
        id: "company-1",
        name: "Kronos",
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
        location: { latitude: -23.55, longitude: -46.63 },
      },
    ] as any);
    mockFetchCompanyDetails.mockResolvedValue({
      id: "company-1",
      name: "Kronos",
      cnpj: "12345678000199",
      email: "contato@kronos.com",
      active: true,
      activeEmployees: 2,
      inactiveEmployees: 0,
      address: {
        postalCode: "01001000",
        number: "100",
        street: "Rua A",
        city: "São Paulo",
        state: "SP",
      },
    } as any);
    mockUpdateCompany.mockResolvedValue(undefined);
    mockGetGeolocationFromCEP.mockResolvedValue({
      latitude: -23.56,
      longitude: -46.64,
    });
  });

  it("carrega empresa, limpa coordenadas quando o endereço muda e salva com nova geolocalização", async () => {
    const { result } = renderHook(() => useUpdateCompanyForm(), { wrapper });

    await waitFor(() => {
      expect(result.current.companies).toHaveLength(1);
    });

    await act(async () => {
      result.current.form.setValue("selectedCnpj", "12345678000199");
    });

    await waitFor(() => {
      expect(result.current.originalCompany?.cnpj).toBe("12345678000199");
    });

    expect(result.current.form.getValues("latitude")).toBeNull();
    expect(result.current.form.getValues("longitude")).toBeNull();

    await act(async () => {
      result.current.form.setValue("address.postalCode", "01002000");
      result.current.form.setValue("address.number", "200");
    });

    await waitFor(() => {
      expect(result.current.form.getValues("latitude")).toBeNull();
      expect(result.current.form.getValues("longitude")).toBeNull();
    });

    await act(async () => {
      await result.current.onSubmit({ preventDefault: vi.fn() } as any);
    });

    expect(mockGetGeolocationFromCEP).toHaveBeenCalledWith("01002000", "200");
    expect(mockUpdateCompany).toHaveBeenCalledWith(
      "12345678000199",
      expect.objectContaining({
        address: {
          postalCode: "01002000",
          number: "200",
        },
        location: {
          latitude: -23.56,
          longitude: -46.64,
        },
      })
    );
  });
});
