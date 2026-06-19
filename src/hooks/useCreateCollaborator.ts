import { type ChangeEvent, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
import { preloadCsrfToken } from "@/service/csrf.service";
import {
  checkCpfAvailability,
  checkUsernameAvailability,
  createCollaborator,
  createUser,
} from "@/service/collaborator-management.service";
import {
  cepMask,
  cpfMask,
  currencyMask,
  currencyValue,
  phoneMask,
} from "@/features/collaborators/create/utils/create-collaborator-formatters";
import {
  COLLABORATOR_LONG_DAY_OPTIONS,
  COLLABORATOR_SCHEDULE_OPTIONS,
} from "@/features/collaborators/create/constants";
import { safeLogger } from "@/utils/security/safeLogger";

const employeeSchema = z.object({
  nomeCompleto: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  cpf: z.string().length(14, "CPF deve ter 11 dígitos"),
  cargo: z.string().min(2, "Cargo deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  salario: z.string().min(1, "Salário é obrigatório"),
  telefone: z.string().length(15, "Telefone deve ter 11 dígitos"),
  cep: z.string().length(9, "CEP deve ter 8 dígitos"),
  numero: z.string().min(1, "Número é obrigatório"),
  faceImageBase64: z.string().optional(),
  homeOffice: z.enum(["true", "false"], {
    required_error: "O status Home Office é obrigatório.",
  }),
  workStartTime: z.string().min(1, "Início da jornada obrigatório"),
  workEndTime: z.string().min(1, "Fim da jornada obrigatório"),
  breakStartTime: z.string().min(1, "Início do intervalo obrigatório"),
  breakEndTime: z.string().min(1, "Fim do intervalo obrigatório"),
  scheduleType: z.string().min(1, "Tipo de escala é obrigatório"),
  scaleStartDate: z.string().optional(),
  preferredDayOff: z.string().optional(),
  weekendOffIndex: z.string().optional(),
  fixedWorkDays: z.array(z.string()).optional(),
});

const userSchema = z.object({
  username: z.string().min(4, "Usuário deve ter pelo menos 4 caracteres"),
  role: z.enum(["MANAGER", "PARTNER"]),
});

const formSchema = employeeSchema.extend({
  username: z.string().optional(),
  role: z.enum(["MANAGER", "PARTNER"]).optional(),
});

export type CollaboratorFormData = z.infer<typeof employeeSchema> & z.infer<typeof userSchema>;

export const useCreateCollaborator = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [savedEmployeeId, setSavedEmployeeId] = useState<string | null>(null);
  const [stepCompleted, setStepCompleted] = useState(false);
  const [cpfAvailability, setCpfAvailability] = useState<"available" | "unavailable" | "checking" | null>(null);
  const [isCheckingCPF, setIsCheckingCPF] = useState(false);
  const [usernameAvailability, setUsernameAvailability] = useState<"available" | "unavailable" | "checking" | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [faceImageBase64, setFaceImageBase64] = useState<string | undefined>(undefined);
  const [fileName, setFileName] = useState<string | undefined>(undefined);

  const form = useForm<CollaboratorFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomeCompleto: "",
      cpf: "",
      cargo: "",
      email: "",
      salario: "",
      telefone: "",
      cep: "",
      numero: "",
      homeOffice: "false",
      workStartTime: "08:00",
      workEndTime: "17:00",
      breakStartTime: "12:00",
      breakEndTime: "13:00",
      scheduleType: "TRADITIONAL_5X2",
      fixedWorkDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
      username: "",
      role: "PARTNER",
    },
  });

  const selectedScheduleType = form.watch("scheduleType");

  const maskCPF = useCallback((value: string) => {
    return cpfMask(value);
  }, []);

  const maskPhone = useCallback((value: string) => {
    return phoneMask(value);
  }, []);

  const maskCEP = useCallback((value: string) => {
    return cepMask(value);
  }, []);

  const maskCurrency = useCallback((value: string) => {
    return currencyMask(value);
  }, []);

  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  const handleImageUpload = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(",")[1];
        setFaceImageBase64(base64Data);
      };
      reader.readAsDataURL(file);
    } else {
      setFileName(undefined);
      setFaceImageBase64(undefined);
    }
  }, []);

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
      setCpfAvailability(available ? "available" : "unavailable");
      toast({
        title: available ? "CPF disponível!" : "CPF indisponível",
        description: available
          ? "Você pode usar este CPF para o registro."
          : "Este CPF já está cadastrado no sistema.",
        variant: available ? "default" : "destructive",
      });
    } catch (error) {
      safeLogger.error("Erro na comunicação com a API:", error);
      toast({ title: "Erro de rede", description: "Falha ao conectar com o servidor.", variant: "destructive" });
      setCpfAvailability(null);
    } finally {
      setIsCheckingCPF(false);
    }
  }, [form]);

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
      setUsernameAvailability(available ? "available" : "unavailable");
      toast({
        title: available ? "Nome de usuário disponível!" : "Nome de usuário indisponível",
        description: available
          ? "Você pode usar este nome de usuário para o registro."
          : "Este nome de usuário já está em uso.",
        variant: available ? "default" : "destructive",
      });
    } catch (error) {
      safeLogger.error("Erro na comunicação com a API:", error);
      toast({ title: "Erro de rede", description: "Falha ao conectar com o servidor.", variant: "destructive" });
      setUsernameAvailability(null);
    } finally {
      setIsCheckingUsername(false);
    }
  }, [form, stepCompleted]);

  const handleCreateEmployee = useCallback(async (data: CollaboratorFormData) => {
    // Guard against multiple concurrent submissions
    if (isSubmitting) {
      return;
    }

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
      // Pre-load CSRF token before making the request
      await preloadCsrfToken();
      const employeePayload = {
        fullName: data.nomeCompleto,
        cpf: data.cpf.replace(/\D/g, ""),
        jobPosition: data.cargo,
        email: data.email,
        salary: currencyValue(data.salario),
        phone: data.telefone.replace(/\D/g, ""),
        homeOffice: data.homeOffice === "true",
        faceImageBase64,
        address: {
          postalCode: data.cep.replace(/\D/g, ""),
          number: data.numero,
        },
        workStartTime: data.workStartTime,
        workEndTime: data.workEndTime,
        breakStartTime: data.breakStartTime,
        breakEndTime: data.breakEndTime,
        scheduleType: data.scheduleType,
        scaleStartDate: data.scaleStartDate || null,
        preferredDayOff: data.preferredDayOff || null,
        weekendOffIndex: data.weekendOffIndex ? parseInt(data.weekendOffIndex) : null,
        fixedWorkDays: data.fixedWorkDays || [],
      };

      const employeeData = await createCollaborator(employeePayload);
      setSavedEmployeeId(employeeData.employeeId);
      setStepCompleted(true);
      toast({
        title: "Colaborador criado!",
        description: `O registro de ${data.nomeCompleto} foi salvo. Prossiga para vincular o acesso do usuário.`,
      });
      return true;
    } catch (error) {
      safeLogger.error("Erro no Passo 1 (Colaborador):", error);
      toast({
        title: "Erro ao cadastrar colaborador",
        description: error instanceof Error ? error.message : "Tente novamente mais tarde.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, cpfAvailability, faceImageBase64]);

  const handleCreateUser = useCallback(async (data: CollaboratorFormData) => {
    // Guard against multiple concurrent submissions
    if (isSubmitting) {
      return;
    }

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
      // Pre-load CSRF token before making the request
      await preloadCsrfToken();

      const userPayload = {
        username: data.username,
        role: data.role,
        employeeId: savedEmployeeId,
      };

      await createUser(userPayload);
      toast({
        title: "Cadastro Concluído!",
        description: `O colaborador e o vínculo de acesso (${data.username}) foram criados com sucesso.`,
      });
      form.reset();
      setSavedEmployeeId(null);
      setStepCompleted(false);
      setUsernameAvailability(null);
      setFaceImageBase64(undefined);
      setFileName(undefined);
      return true;
    } catch (error) {
      safeLogger.error("Erro no Passo 2 (Usuário):", error);
      toast({
        title: "Erro ao criar usuário",
        description: error instanceof Error ? error.message : "Tente novamente mais tarde.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, form, savedEmployeeId, usernameAvailability]);

  const onSubmit = useCallback((data: CollaboratorFormData) => {
    if (!stepCompleted) {
      void handleCreateEmployee(data);
    } else {
      void handleCreateUser(data);
    }
  }, [handleCreateEmployee, handleCreateUser, stepCompleted]);

  const submitEmployee = useCallback(async () => {
    let success = false;

    await form.handleSubmit(async (data) => {
      success = (await handleCreateEmployee(data)) ?? false;
    })();

    return success;
  }, [form, handleCreateEmployee]);

  const submitUser = useCallback(async () => {
    let success = false;

    await form.handleSubmit(async (data) => {
      success = (await handleCreateUser(data)) ?? false;
    })();

    return success;
  }, [form, handleCreateUser]);

  return {
    form,
    isSubmitting,
    sidebarOpen,
    handleToggleSidebar,
    savedEmployeeId,
    stepCompleted,
    cpfAvailability,
    isCheckingCPF,
    usernameAvailability,
    isCheckingUsername,
    faceImageBase64,
    fileName,
    selectedScheduleType,
    maskCPF,
    maskPhone,
    maskCEP,
    maskCurrency,
    handleImageUpload,
    handleCheckCPF,
    handleCheckUsername,
    submitEmployee,
    submitUser,
    onSubmit,
    scheduleTypes: COLLABORATOR_SCHEDULE_OPTIONS,
    daysOfWeek: COLLABORATOR_LONG_DAY_OPTIONS,
  };
};

export type UseCreateCollaboratorReturn = ReturnType<typeof useCreateCollaborator>;
