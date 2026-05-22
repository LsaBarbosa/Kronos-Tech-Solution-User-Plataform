import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { APP_PATHS } from "@/config/app-routes";
import { useCreateCompany } from "./useCreateCompany";
import {
  checkCompanyCnpjAvailability,
  createCompany,
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
  checkCompanyCnpjAvailability: vi.fn(),
  createCompany: vi.fn(),
  getGeolocationFromCEP: vi.fn(),
}));

const mockCheckCompanyCnpjAvailability = vi.mocked(checkCompanyCnpjAvailability);
const mockCreateCompany = vi.mocked(createCompany);
const mockGetGeolocationFromCEP = vi.mocked(getGeolocationFromCEP);

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("useCreateCompany", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockCheckCompanyCnpjAvailability.mockResolvedValue(true);
    mockCreateCompany.mockResolvedValue(undefined);
    mockGetGeolocationFromCEP.mockResolvedValue({
      latitude: -23.55052,
      longitude: -46.633308,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("cria apenas a empresa na etapa 1 e navega para a criação do administrador", async () => {
    const { result } = renderHook(() => useCreateCompany(), { wrapper });

    await act(async () => {
      result.current.form.setValue("name", "Kronos Tech");
      result.current.form.setValue("cnpj", "12345678000199");
      result.current.form.setValue("email", "contato@kronos.com");
      result.current.form.setValue("address.postalCode", "01001000");
      result.current.form.setValue("address.number", "100");
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(mockGetGeolocationFromCEP).toHaveBeenCalledWith("01001000", "100");

    await act(async () => {
      await result.current.handleCheckCNPJ("12345678000199");
    });

    expect(result.current.cnpjAvailability).toBe("available");

    await act(async () => {
      await result.current.form.handleSubmit(result.current.onSubmit)();
    });

    expect(mockCreateCompany).toHaveBeenCalledWith({
      name: "Kronos Tech",
      cnpj: "12345678000199",
      email: "contato@kronos.com",
      address: {
        postalCode: "01001000",
        number: "100",
      },
      location: {
        latitude: -23.55052,
        longitude: -46.633308,
      },
    });
    expect(navigateMock).toHaveBeenCalledWith(APP_PATHS.criarAdministrador);
  });
});
