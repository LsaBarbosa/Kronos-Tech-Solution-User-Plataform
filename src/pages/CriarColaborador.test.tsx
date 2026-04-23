import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CriarColaborador from "./CriarColaborador";
import { toast } from "@/hooks/use-toast";
import {
  checkCpfAvailability,
  checkUsernameAvailability,
  createCollaborator,
  createUser,
} from "@/service/collaborator-management.service";

vi.mock("@/components/Header", () => ({
  default: () => <div data-testid="header" />,
}));

vi.mock("@/components/Sidebar", () => ({
  default: () => <div data-testid="sidebar" />,
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

vi.mock("@/service/collaborator-management.service", () => ({
  checkCpfAvailability: vi.fn(),
  checkUsernameAvailability: vi.fn(),
  createCollaborator: vi.fn(),
  createUser: vi.fn(),
}));

const mockToast = vi.mocked(toast);
const mockCheckCpfAvailability = vi.mocked(checkCpfAvailability);
const mockCheckUsernameAvailability = vi.mocked(checkUsernameAvailability);
const mockCreateCollaborator = vi.mocked(createCollaborator);
const mockCreateUser = vi.mocked(createUser);

const renderPage = () =>
  render(
    <MemoryRouter>
      <CriarColaborador />
    </MemoryRouter>
  );

const fillStepOne = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText("Nome Completo"), "Maria Silva");
  await user.type(screen.getByLabelText("CPF"), "12345678901");
  await user.type(screen.getByLabelText("Cargo"), "Analista");
  await user.type(screen.getByLabelText("Email"), "maria@exemplo.com");
  await user.type(screen.getByLabelText("Salário"), "4200");
  await user.type(screen.getByLabelText("Telefone"), "11999999999");
  await user.type(screen.getByLabelText("CEP"), "01001000");
  await user.type(screen.getByLabelText("Número"), "100");
};

describe("CriarColaborador", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckCpfAvailability.mockResolvedValue(true);
    mockCheckUsernameAvailability.mockResolvedValue(true);
    mockCreateCollaborator.mockResolvedValue({ employeeId: "emp-123" });
    mockCreateUser.mockResolvedValue(undefined);
  });

  it("não permite concluir o passo 2 sem finalizar o passo 1", () => {
    renderPage();

    expect(
      screen.queryByRole("button", { name: "Concluir Cadastro" })
    ).not.toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Verificar" })[1]
    ).toBeDisabled();
  });

  it("avança do passo 1 para o passo 2 após criar o colaborador", async () => {
    const user = userEvent.setup();
    renderPage();

    await fillStepOne(user);
    await user.click(screen.getAllByRole("button", { name: "Verificar" })[0]);

    await waitFor(() => {
      expect(mockCheckCpfAvailability).toHaveBeenCalledWith("12345678901");
    });

    await user.click(
      screen.getByRole("button", { name: "Salvar Dados e Continuar" })
    );

    await waitFor(() => {
      expect(mockCreateCollaborator).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: "Maria Silva",
          cpf: "12345678901",
          jobPosition: "Analista",
        })
      );
    });

    expect(screen.getByText("Passo 1 Concluído! Prossiga abaixo.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Concluir Cadastro" })).toBeInTheDocument();
  });

  it("não conclui o cadastro sem validar o username", async () => {
    const user = userEvent.setup();
    renderPage();

    await fillStepOne(user);
    await user.click(screen.getAllByRole("button", { name: "Verificar" })[0]);
    await user.click(
      screen.getByRole("button", { name: "Salvar Dados e Continuar" })
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Concluir Cadastro" })).toBeDisabled();
    });
  });

  it("finaliza o cadastro após verificar username e criar usuario", async () => {
    const user = userEvent.setup();
    renderPage();

    await fillStepOne(user);
    await user.click(screen.getAllByRole("button", { name: "Verificar" })[0]);
    await user.click(
      screen.getByRole("button", { name: "Salvar Dados e Continuar" })
    );

    await user.type(screen.getByLabelText("Nome de Usuário"), "maria.silva");
    await user.click(screen.getAllByRole("button", { name: "Verificar" })[1]);

    await waitFor(() => {
      expect(mockCheckUsernameAvailability).toHaveBeenCalledWith("maria.silva");
    });

    await user.click(screen.getByRole("button", { name: "Concluir Cadastro" }));

    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith({
        username: "maria.silva",
        role: "PARTNER",
        employeeId: "emp-123",
      });
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Cadastro Concluído!",
      })
    );
  });
});
