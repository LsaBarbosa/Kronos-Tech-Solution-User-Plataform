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

vi.mock("@/service/company.service", () => ({
  fetchCompanyList: vi.fn().mockResolvedValue([
    { id: "company-1", name: "Empresa Teste", active: true },
  ]),
}));

vi.mock("@/service/employee.service", () => ({
  findEmployeeByCpf: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/service/csrf.service", () => ({
  preloadCsrfToken: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/components/faq/FaqSearchTrigger", () => ({
  FaqSearchTrigger: () => null,
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

    // Aguarda heading principal do desktop
    expect(
      await screen.findByRole("heading", { name: /Cadastro de colaborador/i })
    ).toBeInTheDocument();

    // Digita CPF primeiro (requisito para habilitar o botão Verificar)
    const cpfInput = screen.getByLabelText("CPF");
    await user.type(cpfInput, "12345678901");

    // Aguarda empresa carregar (auto-selecionada por ser a única) e Verificar habilitar
    const verificarBtn = screen.getByRole("button", { name: /Verificar/i });
    await waitFor(() => expect(verificarBtn).not.toBeDisabled(), { timeout: 5000 });

    await user.click(verificarBtn);
    await waitFor(() => {
      expect(mockCheckCpfAvailability).toHaveBeenCalledWith("12345678901", "company-1");
    });

    // Preenche os demais campos obrigatórios
    await user.type(screen.getByLabelText("Nome completo"), "Maria Silva");
    await user.type(screen.getByLabelText("Cargo"), "Analista");
    await user.type(screen.getByLabelText(/E-mail|Email/i), "maria@exemplo.com");
    await user.type(screen.getByLabelText("Telefone"), "11999999999");
    await user.type(screen.getByLabelText("Salário"), "4200");
    await user.type(screen.getByLabelText(/CEP/i), "01001000");
    await user.type(screen.getByLabelText("Número"), "100");

    // Botão de criar fica habilitado após CPF disponível
    const submitBtn = screen.getByRole("button", { name: /Criar colaborador/i });
    await waitFor(() => expect(submitBtn).not.toBeDisabled());
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateCollaborator).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: "Maria Silva",
          cpf: "12345678901",
          jobPosition: "Analista",
        })
      );
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Colaborador criado!",
      })
    );
  }, 20000);

  it("renderiza a experiência mobile com stepper próprio", async () => {
    const user = userEvent.setup();
    mockResponsiveMode.mockReturnValue({
      isDesktop: false,
      isMobile: true,
      mode: "mobile",
    });

    renderPage();

    // Heading mobile
    expect(await screen.findByText("Novo cadastro")).toBeInTheDocument();

    // O botão "Próximo: Escala" existe mas está desabilitado até empresa + CPF verificado
    expect(screen.getByRole("button", { name: "Próximo: Escala" })).toBeInTheDocument();

    // Digita CPF para habilitar o botão Verificar
    const cpfInput = screen.getByLabelText("CPF");
    await user.type(cpfInput, "12345678901");

    // Aguarda empresa auto-carregar e botão Verificar ficar habilitado
    const verificarBtn = screen.getByRole("button", { name: /Verificar/i });
    await waitFor(() => expect(verificarBtn).not.toBeDisabled(), { timeout: 5000 });

    await user.click(verificarBtn);

    // Após verificação, "Próximo: Escala" fica habilitado
    const nextBtn = screen.getByRole("button", { name: "Próximo: Escala" });
    await waitFor(() => expect(nextBtn).not.toBeDisabled(), { timeout: 5000 });

    await user.click(nextBtn);

    // Avançou para o step 1: botão muda para "Criar colaborador"
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Criar colaborador/i })).toBeInTheDocument();
    });
  }, 20000);
});
