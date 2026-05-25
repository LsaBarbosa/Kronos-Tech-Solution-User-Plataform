import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BiometricConsentCard from "./BiometricConsentCard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const authMocks = vi.hoisted(() => ({
  checkSession: vi.fn(),
}));

const termsMocks = vi.hoisted(() => ({
  checkTermsStatus: vi.fn(),
  revokeBiometricTerms: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    checkSession: authMocks.checkSession,
  }),
}));

vi.mock("@/service/terms.service", () => ({
  checkTermsStatus: termsMocks.checkTermsStatus,
  revokeBiometricTerms: termsMocks.revokeBiometricTerms,
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

const renderWithProviders = (component: React.ReactElement) => {
  const queryClientForTest = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClientForTest}>
      {component}
    </QueryClientProvider>
  );
};

describe("BiometricConsentCard", () => {
  beforeEach(() => {
    authMocks.checkSession.mockReset();
    termsMocks.checkTermsStatus.mockReset();
    termsMocks.revokeBiometricTerms.mockReset();
    authMocks.checkSession.mockResolvedValue(undefined);
    termsMocks.revokeBiometricTerms.mockResolvedValue(undefined);
  });

  it("exibe consentimento ativo quando accepted=true", async () => {
    termsMocks.checkTermsStatus.mockResolvedValue({ accepted: true });

    renderWithProviders(<BiometricConsentCard />);

    expect(await screen.findByText(/Consentimento Ativo/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Revogar Consentimento/i })).not.toBeDisabled();
  });

  it("exibe consentimento revogado quando accepted=false", async () => {
    termsMocks.checkTermsStatus.mockResolvedValue({ accepted: false });

    renderWithProviders(<BiometricConsentCard />);

    expect(await screen.findByText(/consentimento está pendente/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Revogar Consentimento/i })).not.toBeInTheDocument();
  });

  it("exibe consentimento ativo e permite abrir o dialogo de revogacao", async () => {
    termsMocks.checkTermsStatus.mockResolvedValue({ accepted: true });

    renderWithProviders(<BiometricConsentCard />);

    expect(await screen.findByText(/Consentimento Ativo/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Revogar Consentimento/i }));

    expect(
      screen.getByRole("heading", { name: /Revogar consentimento biometrico/i })
    ).toBeInTheDocument();
  });

  it("revoga a biometria e atualiza a sessao apos confirmar", async () => {
    termsMocks.checkTermsStatus.mockResolvedValue({ accepted: true });

    renderWithProviders(<BiometricConsentCard />);

    await screen.findByText(/Consentimento Ativo/);
    await userEvent.click(screen.getByRole("button", { name: /Revogar Consentimento/i }));
    await userEvent.click(screen.getByRole("button", { name: /Confirmar revogacao/i }));

    await waitFor(() => {
      expect(termsMocks.revokeBiometricTerms).toHaveBeenCalledTimes(1);
      expect(authMocks.checkSession).toHaveBeenCalledTimes(1);
    });
  });

  it("permite cancelar a revogacao", async () => {
    termsMocks.checkTermsStatus.mockResolvedValue({ accepted: true });

    renderWithProviders(<BiometricConsentCard />);

    await screen.findByText(/Consentimento Ativo/);
    await userEvent.click(screen.getByRole("button", { name: /Revogar Consentimento/i }));
    await userEvent.click(screen.getByRole("button", { name: /Cancelar/i }));

    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: /Revogar consentimento biometrico/i })
      ).not.toBeInTheDocument();
    });
    expect(termsMocks.revokeBiometricTerms).not.toHaveBeenCalled();
  });

  it("mostra erro e permite recarregar o status", async () => {
    termsMocks.checkTermsStatus
      .mockRejectedValueOnce(new Error("Falha ao consultar status"))
      .mockResolvedValueOnce({ accepted: false });

    renderWithProviders(<BiometricConsentCard />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Falha ao consultar status");

    await userEvent.click(screen.getByRole("button", { name: /Tentar novamente/i }));

    expect(await screen.findByText(/consentimento está pendente/)).toBeInTheDocument();
  });
});
