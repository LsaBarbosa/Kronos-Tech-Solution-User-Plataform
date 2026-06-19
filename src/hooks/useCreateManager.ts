import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { fetchCompanyList } from "@/service/company.service";
import {
  checkCpfAvailability,
  checkUsernameAvailability,
  createManager,
  createUser,
} from "@/service/collaborator-management.service";
import { safeLogger } from "@/utils/security/safeLogger";

const scheduleTypes = [
  { value: "TRADITIONAL_5X2", label: "Tradicional 5x2 (Seg-Sex)" },
  { value: "SIX_BY_ONE_FIXED", label: "6x1 com Folga Fixa" },
  { value: "ROTATING_12X36", label: "Plantão 12x36" },
  { value: "ROTATING_24X72", label: "Plantão 24x72" },
  { value: "SIX_BY_ONE_TWO_WEEKENDS", label: "6x1 + 2 Finais de Semana" },
  { value: "SIX_BY_ONE_ONE_WEEKEND", label: "6x1 + 1 Final de Semana" },
];

const daysOfWeek = [
  { value: "MONDAY", label: "Segunda-feira" },
  { value: "TUESDAY", label: "Terça-feira" },
  { value: "WEDNESDAY", label: "Quarta-feira" },
  { value: "THURSDAY", label: "Quinta-feira" },
  { value: "FRIDAY", label: "Sexta-feira" },
  { value: "SATURDAY", label: "Sábado" },
  { value: "SUNDAY", label: "Domingo" },
];

const employeeSchema = z.object({
  companyId: z.string().min(1, "Selecione a empresa do colaborador"),
  nomeCompleto: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  cpf: z.string().length(14, "CPF deve ter 11 dígitos"),
  cargo: z.string().min(2, "Cargo deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  salario: z.string().min(1, "Salário é obrigatório"),
  telefone: z.string().length(15, "Telefone deve ter 11 dígitos"),
  cep: z.string().length(9, "CEP deve ter 8 dígitos"),
  numero: z.string().min(1, "Número é obrigatório"),
  scheduleType: z.string().min(1, "Tipo de escala é obrigatório"),
  scaleStartDate: z.string().optional(),
  preferredDayOff: z.string().optional(),
  weekendOffIndex: z.string().optional(),
  fixedWorkDays: z.array(z.string()).optional(),
});

const userSchema = z.object({
  username: z.string().min(4, "Usuário deve ter pelo menos 4 caracteres"),
  role: z.literal("MANAGER"),
});

const formSchema = employeeSchema.extend({
  username: z.string().optional(),
  role: z.literal("MANAGER").optional(),
});

export type ManagerFormData = z.infer<typeof employeeSchema> & z.infer<typeof userSchema>;

interface Company {
  companyId: string;
  name: string;
}

export const useCreateManager = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isFetchingCompanies, setIsFetchingCompanies] = useState(true);
  const [savedEmployeeId, setSavedEmployeeId] = useState<string | null>(null);
  const [stepCompleted, setStepCompleted] = useState(false);
  const [usernameAvailability, setUsernameAvailability] = useState<"available" | "unavailable" | "checking" | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [cpfAvailability, setCpfAvailability] = useState<"available" | "unavailable" | "checking" | null>(null);
  const [isCheckingCPF, setIsCheckingCPF] = useState(false);

  const form = useForm<ManagerFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyId: "",
      nomeCompleto: "",
      cpf: "",
      cargo: "",
      email: "",
      salario: "",
      telefone: "",
      cep: "",
      numero: "",
      scheduleType: "TRADITIONAL_5X2",
      fixedWorkDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
      username: "",
      role: "MANAGER",
    },
  });

  const selectedScheduleType = form.watch("scheduleType");

  const maskCPF = useCallback((value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  }, []);

  const maskPhone = useCallback((value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4,5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  }, []);

  const maskCEP = useCallback((value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{3})\d+?$/, "$1");
  }, []);

  const maskCurrency = useCallback((value: string) => {
    const numericValue = value.replace(/\D/g, "");
    return (parseFloat(numericValue) / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }, []);

  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  const fetchCompanies = useCallback(async () => {
    setIsFetchingCompanies(true);
    try {
      const data = await fetchCompanyList();
      setCompanies(data.map((company) => ({
        companyId: company.id,
        name: company.name,
      })));
    } catch (error) {
      safeLogger.error("Erro ao buscar empresas:", error);
      toast({ title: "Erro", description: "Não foi possível carregar a lista de empresas.", variant: "destructive" });
    } finally {
      setIsFetchingCompanies(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchCompanies();
  }, [fetchCompanies]);

  const handleCheckCPF = useCallback(async () => {
    const cpfWithMask = form.getValues("cpf");
    const cpf = cpfWithMask.replace(/\D/g, "");

    if (cpf.length !== 11) {
      toast({
        title: "Erro de validação",
        description: "O CPF deve ter 11 dígitos.",
        variant: "destructive",
      });
      setCpfAvailability(null);
      return;
    }

    setIsCheckingCPF(true);
    setCpfAvailability("checking");

    try {
      const available = await checkCpfAvailability(cpf);
      if (!available) {
        toast({ title: "CPF indisponível", description: "Este CPF já está cadastrado no sistema.", variant: "destructive" });
        setCpfAvailability("unavailable");
      } else {
        toast({ title: "CPF disponível!", description: "Você pode usar este CPF para o registro." });
        setCpfAvailability("available");
      }
    } catch (error) {
      safeLogger.error("Erro na comunicação com a API:", error);
      toast({ title: "Erro de rede", description: "Falha ao conectar com o servidor.", variant: "destructive" });
      setCpfAvailability(null);
    } finally {
      setIsCheckingCPF(false);
    }
  }, [form, toast]);

  const handleCheckUsername = useCallback(async () => {
    if (!stepCompleted) {
      toast({
        title: "Passo Incompleto",
        description: "Por favor, conclua primeiro o cadastro do Colaborador (Passo 1).",
        variant: "destructive",
      });
      setUsernameAvailability(null);
      return;
    }

    const username = form.getValues("username");
    const usernameValidation = userSchema.pick({ username: true }).safeParse({ username });

    if (!usernameValidation.success) {
      toast({
        title: "Erro de validação",
        description: "O nome de usuário deve ter pelo menos 4 caracteres.",
        variant: "destructive",
      });
      setUsernameAvailability(null);
      return;
    }

    setIsCheckingUsername(true);
    setUsernameAvailability("checking");

    try {
      const available = await checkUsernameAvailability(username);
      if (!available) {
        toast({ title: "Nome de usuário indisponível", description: "Este nome de usuário já está em uso.", variant: "destructive" });
        setUsernameAvailability("unavailable");
      } else {
        toast({ title: "Nome de usuário disponível!", description: "Você pode usar este nome de usuário para o registro." });
        setUsernameAvailability("available");
      }
    } catch (error) {
      safeLogger.error("Erro na comunicação com a API:", error);
      toast({ title: "Erro de rede", description: "Falha ao conectar com o servidor.", variant: "destructive" });
      setUsernameAvailability(null);
    } finally {
      setIsCheckingUsername(false);
    }
  }, [form, stepCompleted, toast]);

  const handleCreateEmployee = useCallback(async (data: ManagerFormData) => {
    setIsSubmitting(true);

    const employeeValidation = employeeSchema.safeParse(data);
    if (!employeeValidation.success) {
      toast({
        title: "Erro de validação",
        description: "Preencha corretamente os Dados do Colaborador (Passo 1).",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (cpfAvailability !== "available") {
      toast({
        title: "Ação Pendente",
        description: "É necessário verificar a disponibilidade do CPF antes de continuar.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const employeePayload = {
        companyId: data.companyId,
        fullName: data.nomeCompleto,
        cpf: data.cpf.replace(/\D/g, ""),
        jobPosition: data.cargo,
        email: data.email,
        salary: parseFloat(data.salario.replace(/[R$\s.]/g, "").replace(",", ".")),
        phone: data.telefone.replace(/\D/g, ""),
        address: {
          postalCode: data.cep.replace(/\D/g, ""),
          number: data.numero,
        },
        scheduleType: data.scheduleType,
        scaleStartDate: data.scaleStartDate || null,
        preferredDayOff: data.preferredDayOff || null,
        weekendOffIndex: data.weekendOffIndex ? parseInt(data.weekendOffIndex) : null,
        fixedWorkDays: data.fixedWorkDays || [],
      };
      const employeeData = await createManager(employeePayload);
      setSavedEmployeeId(employeeData.employeeId);
      setStepCompleted(true);
      toast({
        title: "Colaborador criado!",
        description: `O registro de ${data.nomeCompleto} foi salvo. Prossiga para as credenciais de usuário.`,
      });
    } catch (error) {
      safeLogger.error("Erro no Passo 1 (Colaborador):", error);
      toast({
        title: "Erro ao cadastrar colaborador",
        description: (error instanceof Error) ? error.message : "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [cpfAvailability, toast]);

  const handleCreateUser = useCallback(async (data: ManagerFormData) => {
    setIsSubmitting(true);

    const userValidation = userSchema.safeParse(data);
    if (!userValidation.success) {
      toast({
        title: "Erro de validação",
        description: "Preencha corretamente os Dados de Usuário (Passo 2).",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (usernameAvailability !== "available") {
      toast({
        title: "Ação Pendente",
        description: "É necessário verificar a disponibilidade do nome de usuário.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!savedEmployeeId) {
      toast({
        title: "Erro de Fluxo",
        description: "O ID do Colaborador não foi encontrado. Por favor, reinicie o cadastro.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const userPayload = {
        username: data.username,
        role: "MANAGER" as const,
        employeeId: savedEmployeeId,
      };
      await createUser(userPayload);

      toast({
        title: "Cadastro Concluído!",
        description: `O colaborador e usuário (${data.username}) foram criados com sucesso!`,
      });

      form.reset();
      setSavedEmployeeId(null);
      setStepCompleted(false);
      setUsernameAvailability(null);
      setCpfAvailability(null);
      navigate("/empresa");
    } catch (error) {
      safeLogger.error("Erro no Passo 2 (Usuário):", error);
      toast({
        title: "Erro ao criar usuário",
        description: (error instanceof Error) ? error.message : "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [form, navigate, savedEmployeeId, toast, usernameAvailability]);

  const onSubmit = useCallback((data: ManagerFormData) => {
    if (!stepCompleted) {
      void handleCreateEmployee(data);
      return;
    }

    void handleCreateUser(data);
  }, [handleCreateEmployee, handleCreateUser, stepCompleted]);

  return {
    form,
    isSubmitting,
    sidebarOpen,
    handleToggleSidebar,
    companies,
    isFetchingCompanies,
    savedEmployeeId,
    stepCompleted,
    usernameAvailability,
    isCheckingUsername,
    resetUsernameAvailability: () => setUsernameAvailability(null),
    cpfAvailability,
    isCheckingCPF,
    resetCpfAvailability: () => setCpfAvailability(null),
    selectedScheduleType,
    maskCPF,
    maskPhone,
    maskCEP,
    maskCurrency,
    handleCheckCPF,
    handleCheckUsername,
    onSubmit,
    scheduleTypes,
    daysOfWeek,
  };
};
