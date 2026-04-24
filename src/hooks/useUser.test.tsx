import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ServiceError } from "@/service/helpers/service-error.helper";
import { useUser } from "./useUser";
import { useToast } from "@/hooks/use-toast";
import { loadSessionProfile } from "@/service/session-profile.service";
import { useAuth } from "@/context/AuthContext";
import { getBiometricTermStatus, revokeBiometricTerms } from "@/service/terms.service";

const navigateMock = vi.fn();
const toastMock = vi.fn();
const logoutMock = vi.fn();

vi.mock("@/hooks/use-toast", () => ({
  useToast: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
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

vi.mock("@/service/session-profile.service", () => ({
  loadSessionProfile: vi.fn(),
}));

vi.mock("@/service/user.service", () => ({
  updateEmail: vi.fn(),
  updatePhone: vi.fn(),
  changePassword: vi.fn(),
}));

vi.mock("@/service/terms.service", () => ({
  getBiometricTermStatus: vi.fn(),
  revokeBiometricTerms: vi.fn(),
}));

const mockUseToast = vi.mocked(useToast);
const mockUseAuth = vi.mocked(useAuth);
const mockLoadSessionProfile = vi.mocked(loadSessionProfile);
const mockGetBiometricTermStatus = vi.mocked(getBiometricTermStatus);
const mockRevokeBiometricTerms = vi.mocked(revokeBiometricTerms);

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("useUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("token", "token-valido");
    mockUseToast.mockReturnValue({ toast: toastMock } as any);
    mockUseAuth.mockReturnValue({ login: vi.fn(), logout: logoutMock } as any);
    logoutMock.mockImplementation(() => {
      localStorage.removeItem("token");
    });
    mockGetBiometricTermStatus.mockResolvedValue({ accepted: true });
  });

  it("monta a sessao composta ao carregar os dados", async () => {
    mockLoadSessionProfile.mockResolvedValue({
      accountData: {
        userId: "u-1",
        username: "maria",
        role: "PARTNER",
        active: true,
        employeeId: "emp-1",
      },
      profileData: {
        employeeId: "emp-1",
        fullName: "Maria Silva",
        maskedCpf: "123.***.***-01",
        jobPosition: "Analista",
        email: "maria@exemplo.com",
        salary: 4000,
        phone: "11999999999",
        address: {
          street: "Rua A",
          number: "10",
          postalCode: "01001000",
          city: "Sao Paulo",
          state: "SP",
        },
        companyName: "Kronos",
        lastSeenMessageTimestamp: null,
        homeOffice: false,
      },
      userData: {
        employeeId: "emp-1",
        fullName: "Maria Silva",
        maskedCpf: "123.***.***-01",
        jobPosition: "Analista",
        email: "maria@exemplo.com",
        salary: 4000,
        phone: "11999999999",
        address: {
          street: "Rua A",
          number: "10",
          postalCode: "01001000",
          city: "Sao Paulo",
          state: "SP",
        },
        companyName: "Kronos",
        lastSeenMessageTimestamp: null,
        homeOffice: false,
        role: "PARTNER",
      },
      role: "PARTNER",
    });

    const { result } = renderHook(() => useUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.userAccountData).toMatchObject({
        username: "maria",
      });
    });

    expect(result.current.userData).toMatchObject({
      fullName: "Maria Silva",
      role: "PARTNER",
    });
    expect(result.current.newEmail).toBe("maria@exemplo.com");
    expect(result.current.newPhone).toBe("11999999999");
    expect(result.current.biometricConsentAccepted).toBe(true);
  });

  it("redireciona quando a sessao expira", async () => {
    mockLoadSessionProfile.mockRejectedValue(
      new ServiceError("Sessão expirada ou acesso não autorizado.", {
        kind: "auth",
        status: 401,
      })
    );

    renderHook(() => useUser(), { wrapper });

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/login");
    });

    expect(logoutMock).toHaveBeenCalled();
    expect(localStorage.getItem("token")).toBeNull();
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Erro de Autenticação",
      })
    );
  });

  it("revoga o consentimento biométrico e atualiza o estado local", async () => {
    const loginMock = vi.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({ login: loginMock, logout: logoutMock } as any);
    mockRevokeBiometricTerms.mockResolvedValue({
      accepted: false,
      token: "token-revogado",
    });

    mockLoadSessionProfile.mockResolvedValue({
      accountData: {
        userId: "u-1",
        username: "maria",
        role: "PARTNER",
        active: true,
        employeeId: "emp-1",
      },
      profileData: {
        employeeId: "emp-1",
        fullName: "Maria Silva",
        maskedCpf: "123.***.***-01",
        jobPosition: "Analista",
        email: "maria@exemplo.com",
        salary: 4000,
        phone: "11999999999",
        address: {
          street: "Rua A",
          number: "10",
          postalCode: "01001000",
          city: "Sao Paulo",
          state: "SP",
        },
        companyName: "Kronos",
        lastSeenMessageTimestamp: null,
        homeOffice: false,
      },
      userData: {
        employeeId: "emp-1",
        fullName: "Maria Silva",
        maskedCpf: "123.***.***-01",
        jobPosition: "Analista",
        email: "maria@exemplo.com",
        salary: 4000,
        phone: "11999999999",
        address: {
          street: "Rua A",
          number: "10",
          postalCode: "01001000",
          city: "Sao Paulo",
          state: "SP",
        },
        companyName: "Kronos",
        lastSeenMessageTimestamp: null,
        homeOffice: false,
        role: "PARTNER",
      },
      role: "PARTNER",
    });

    const { result } = renderHook(() => useUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.biometricConsentAccepted).toBe(true);
    });

    await act(async () => {
      await result.current.handleRevokeBiometric();
    });

    expect(mockRevokeBiometricTerms).toHaveBeenCalled();
    expect(loginMock).toHaveBeenCalledWith("token-revogado");
    await waitFor(() => {
      expect(result.current.biometricConsentAccepted).toBe(false);
    });
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Sucesso",
        description: "Consentimento biométrico revogado.",
      })
    );
  });
});
