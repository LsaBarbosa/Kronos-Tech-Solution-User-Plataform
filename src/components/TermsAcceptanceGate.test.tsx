import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TermsAcceptanceGate from "./TermsAcceptanceGate";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const authMocks = vi.hoisted(() => ({
  checkSession: vi.fn(),
  logout: vi.fn(),
}));

const termsMocks = vi.hoisted(() => ({
  acceptBiometricTerms: vi.fn(),
  checkTermsStatus: vi.fn(),
  getCurrentBiometricTerm: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    checkSession: authMocks.checkSession,
    logout: authMocks.logout,
  }),
}));

vi.mock("@/service/terms.service", () => ({
  acceptBiometricTerms: termsMocks.acceptBiometricTerms,
  checkTermsStatus: termsMocks.checkTermsStatus,
  getCurrentBiometricTerm: termsMocks.getCurrentBiometricTerm,
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderGate = () => {
  const queryClientForTest = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClientForTest}>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<TermsAcceptanceGate />}>
            <Route path="/" element={<div>Conteudo protegido</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

const markTermsAsScrolledToEnd = () => {
  const viewport = document.querySelector("[data-radix-scroll-area-viewport]");
  expect(viewport).toBeInstanceOf(HTMLElement);

  Object.defineProperty(viewport, "scrollTop", {
    configurable: true,
    value: 260,
  });
  Object.defineProperty(viewport, "clientHeight", {
    configurable: true,
    value: 240,
  });
  Object.defineProperty(viewport, "scrollHeight", {
    configurable: true,
    value: 500,
  });

  fireEvent.scroll(viewport as HTMLElement);
};

describe("TermsAcceptanceGate", () => {
  beforeEach(() => {
    authMocks.checkSession.mockReset();
    authMocks.logout.mockReset();
    termsMocks.acceptBiometricTerms.mockReset();
    termsMocks.checkTermsStatus.mockReset();
    termsMocks.getCurrentBiometricTerm.mockReset();
    authMocks.checkSession.mockResolvedValue(undefined);
    termsMocks.acceptBiometricTerms.mockResolvedValue(undefined);
    termsMocks.getCurrentBiometricTerm.mockResolvedValue({
      type: "BIOMETRIC_CONSENT_TERM",
      version: "2026.05.21",
      title: "Termo de Consentimento Biométrico",
      content: "Conteúdo do termo biométrico.",
      contentHashSha256: "current-hash",
      active: true,
    });
  });

  it("renderiza o conteudo protegido quando o termo ja foi aceito", async () => {
    termsMocks.checkTermsStatus.mockResolvedValue({ accepted: true });

    renderGate();

    expect(await screen.findByText("Conteudo protegido")).toBeInTheDocument();
    expect(screen.queryByText("Termo de Consentimento Biométrico")).not.toBeInTheDocument();
  });

  it("bloqueia o conteudo ate rolar, marcar o aceite e confirmar", async () => {
    termsMocks.checkTermsStatus.mockResolvedValue({ accepted: false });

    renderGate();

    expect(await screen.findByText("Termo de Consentimento Biométrico")).toBeInTheDocument();
    expect(screen.queryByText("Conteudo protegido")).not.toBeInTheDocument();

    const acceptButton = screen.getByRole("button", { name: /Confirmar aceite/i });
    expect(acceptButton).toBeDisabled();

    await userEvent.click(
      screen.getByRole("checkbox", {
        name: /Confirmo que li e aceito o termo de consentimento biométrico/i,
      })
    );
    expect(acceptButton).toBeDisabled();

    markTermsAsScrolledToEnd();

    await waitFor(() => {
      expect(acceptButton).toBeEnabled();
    });

    await userEvent.click(acceptButton);

    await waitFor(() => {
      expect(termsMocks.acceptBiometricTerms).toHaveBeenCalledWith({
        version: "2026.05.21",
        contentHashSha256: "current-hash",
      });
      expect(authMocks.checkSession).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText("Conteudo protegido")).toBeInTheDocument();
  });

  it("permite sair sem aceitar o termo", async () => {
    termsMocks.checkTermsStatus.mockResolvedValue({ accepted: false });

    renderGate();

    await screen.findByText("Termo de Consentimento Biométrico");
    await userEvent.click(screen.getByRole("button", { name: /Sair/i }));

    expect(authMocks.logout).toHaveBeenCalledTimes(1);
    expect(termsMocks.acceptBiometricTerms).not.toHaveBeenCalled();
  });

  it("exibe erro de verificacao e permite tentar novamente", async () => {
    termsMocks.checkTermsStatus
      .mockRejectedValueOnce(new Error("Falha ao consultar termo"))
      .mockResolvedValueOnce({ accepted: true });

    renderGate();

    expect(await screen.findByRole("alert")).toHaveTextContent("Falha ao consultar termo");

    await userEvent.click(screen.getByRole("button", { name: /Tentar novamente/i }));

    expect(await screen.findByText("Conteudo protegido")).toBeInTheDocument();
  });

  it("renderiza o termo retornado pelo backend quando o aceite está pendente", async () => {
    termsMocks.checkTermsStatus.mockResolvedValue({ accepted: false });
    termsMocks.getCurrentBiometricTerm.mockResolvedValue({
      type: "BIOMETRIC_CONSENT_TERM",
      version: "2026.05.21",
      title: "Termo de Consentimento Biométrico",
      content: "Linha 1 do termo.\n\n- Item A",
      contentHashSha256: "current-hash",
      active: true,
    });

    renderGate();

    expect(await screen.findByText(/Linha 1 do termo\./i)).toBeInTheDocument();
    expect(screen.getByText(/Versão: 2026.05.21/i)).toBeInTheDocument();
  });
});
