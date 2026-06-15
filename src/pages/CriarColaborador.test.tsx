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
import { useCreateCollaboratorResponsiveMode } from "@/features/collaborators/create/hooks/useCreateCollaboratorResponsiveMode";

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      account: { username: "lucas.barbosa" },
      profile: { fullName: "Lucas Barbosa" },
      role: "MANAGER",
    },
  }),
}));

vi.mock("@/features/collaborators/create/hooks/useCreateCollaboratorResponsiveMode", () => ({
  useCreateCollaboratorResponsiveMode: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

vi.mock("@/service/collaborator-management.service", () => ({
  checkCpfAvailability: vi.fn(),
  checkUsernameAvailability: vi.fn(),
  createCollaborator: vi.fn(),
  createUser: vi.fn(),
  createManager: vi.fn(),
  fetchEmployeeList: vi.fn().mockResolvedValue([]),
  updateCollaborator: vi.fn(),
  updateUser: vi.fn(),
  toggleUserStatus: vi.fn(),
}));

const mockToast = vi.mocked(toast);
const mockCheckCpfAvailability = vi.mocked(checkCpfAvailability);
const mockCheckUsernameAvailability = vi.mocked(checkUsernameAvailability);
const mockCreateCollaborator = vi.mocked(createCollaborator);
const mockCreateUser = vi.mocked(createUser);
const mockResponsiveMode = vi.mocked(useCreateCollaboratorResponsiveMode);

const renderPage = () =>
  render(
    <MemoryRouter>
      <CriarColaborador />
    </MemoryRouter>
  );

const fillStepOne = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText("Nome completo"), "Maria Silva");
  await user.type(screen.getByLabelText("CPF"), "12345678901");
  await user.type(screen.getByLabelText("Cargo"), "Analista");
  await user.type(screen.getByLabelText("Email"), "maria@exemplo.com");
  await user.type(screen.getByLabelText("Telefone"), "11999999999");
  await user.type(screen.getByLabelText("Salário"), "4200");
  await user.type(screen.getByLabelText("CEP"), "01001000");
  await user.type(screen.getByLabelText("Número"), "100");
};

describe("CriarColaborador", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResponsiveMode.mockReturnValue({
      isDesktop: true,
      isMobile: false,
      mode: "desktop",
    });
    mockCheckCpfAvailability.mockResolvedValue(true);
    mockCheckUsernameAvailability.mockResolvedValue(true);
    mockCreateCollaborator.mockResolvedValue({ employeeId: "emp-123" });
    mockCreateUser.mockResolvedValue(undefined);
  });

  it("renderiza a experiência desktop e conclui o fluxo de onboarding", async () => {
    const user = userEvent.setup();
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Cadastro completo com vínculo de acesso" })
    ).toBeInTheDocument();

    await fillStepOne(user);
    await user.click(screen.getAllByRole("button", { name: "Validar" })[0]);

    await waitFor(() => {
      expect(mockCheckCpfAvailability).toHaveBeenCalledWith("12345678901");
    });

    await user.click(screen.getByRole("button", { name: "Salvar dados" }));

    await waitFor(() => {
      expect(mockCreateCollaborator).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: "Maria Silva",
          cpf: "12345678901",
          jobPosition: "Analista",
        })
      );
    });

    await user.type(screen.getByLabelText("Username"), "maria.silva");
    await user.click(screen.getAllByRole("button", { name: "Validar" })[1]);

    await waitFor(() => {
      expect(mockCheckUsernameAvailability).toHaveBeenCalledWith("maria.silva");
    });

    await user.click(screen.getByRole("button", { name: "Criar acesso" }));

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
  }, 15000);

  it("renderiza a experiência mobile com stepper próprio", async () => {
    const user = userEvent.setup();
    mockResponsiveMode.mockReturnValue({
      isDesktop: false,
      isMobile: true,
      mode: "mobile",
    });

    renderPage();

    expect(screen.getByText("Novo cadastro")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Próximo: Escala" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Próximo: Escala" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Salvar dados e continuar" })).toBeInTheDocument();
    });
  });
});
