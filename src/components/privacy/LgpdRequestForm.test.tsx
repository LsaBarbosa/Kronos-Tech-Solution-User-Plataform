import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LgpdRequestForm from "./LgpdRequestForm";

const lgpdMocks = vi.hoisted(() => ({
  createLgpdRequest: vi.fn(),
}));

const toastMocks = vi.hoisted(() => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("@/service/lgpd.service", () => ({
  createLgpdRequest: lgpdMocks.createLgpdRequest,
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: {
    error: toastMocks.toast.error,
    success: toastMocks.toast.success,
  },
}));

describe("LgpdRequestForm", () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    lgpdMocks.createLgpdRequest.mockReset();
    toastMocks.toast.error.mockReset();
    toastMocks.toast.success.mockReset();
    mockOnSuccess.mockReset();
    lgpdMocks.createLgpdRequest.mockResolvedValue(undefined);
  });

  it("renderiza o formulário com campos obrigatórios", () => {
    render(<LgpdRequestForm onSuccess={mockOnSuccess} />);

    expect(screen.getByLabelText(/Tipo de Solicitação/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descrição/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Enviar Solicitação/i })).toBeInTheDocument();
  });

  it("renderiza campos de tipo e descrição", () => {
    render(<LgpdRequestForm onSuccess={mockOnSuccess} />);

    expect(screen.getByLabelText(/Tipo de Solicitação/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descrição/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Descreva sua solicitação/)).toBeInTheDocument();
  });

  it("desabilita o botão quando campos obrigatórios estão vazios", () => {
    render(<LgpdRequestForm onSuccess={mockOnSuccess} />);

    const button = screen.getByRole("button", { name: /Enviar Solicitação/i });
    expect(button).toBeDisabled();
  });

  it("permite digitar na descrição", async () => {
    render(<LgpdRequestForm onSuccess={mockOnSuccess} />);

    const textarea = screen.getByPlaceholderText(/Descreva sua solicitação/);
    await userEvent.type(textarea, "Teste");

    expect(textarea).toHaveValue("Teste");
  });

  it("exibe contador de caracteres", () => {
    render(<LgpdRequestForm onSuccess={mockOnSuccess} />);

    expect(screen.getByText("0/1000 caracteres")).toBeInTheDocument();
  });
});
