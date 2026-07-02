import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { fetchCompanyList } from "@/service/company.service";
import {
  checkCpfAvailability,
  checkUsernameAvailability,
  createManager,
  createCollaborator,
  createUser,
} from "@/service/collaborator-management.service";
import { safeLogger } from "@/utils/security/safeLogger";
import {
  type UserCreationType,
  type UnifiedFormData,
  type AvailabilityStatus,
  ROLE_BY_TYPE,
  unifiedFormSchema,
} from "../types/create-user.types";

interface Company {
  companyId: string;
  name: string;
}

export const useCreateUserUnified = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { role } = useAuth();

  const isCto = role === "CTO";

  const [selectedType, setSelectedType] = useState<UserCreationType>("ADMINISTRADOR");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isFetchingCompanies, setIsFetchingCompanies] = useState(true);
  const [savedEmployeeId, setSavedEmployeeId] = useState<string | null>(null);
  const [stepCompleted, setStepCompleted] = useState(false);
  const [usernameAvailability, setUsernameAvailability] = useState<AvailabilityStatus>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [cpfAvailability, setCpfAvailability] = useState<AvailabilityStatus>(null);
  const [isCheckingCPF, setIsCheckingCPF] = useState(false);

  const form = useForm<UnifiedFormData>({
    resolver: zodResolver(unifiedFormSchema),
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
      homeOffice: "false",
      workStartTime: "08:00",
      workEndTime: "17:00",
      breakStartTime: "12:00",
      breakEndTime: "13:00",
      username: "",
    },
  });

  const selectedScheduleType = form.watch("scheduleType");

  const handleTypeChange = useCallback((type: UserCreationType) => {
    setSelectedType(type);
    form.reset({
      companyId: form.getValues("companyId"),
      scheduleType: "TRADITIONAL_5X2",
      fixedWorkDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
      homeOffice: "false",
      workStartTime: "08:00",
      workEndTime: "17:00",
      breakStartTime: "12:00",
      breakEndTime: "13:00",
    });
    setSavedEmployeeId(null);
    setStepCompleted(false);
    setCpfAvailability(null);
    setUsernameAvailability(null);
  }, [form]);

  const maskCPF = useCallback((value: string) =>
    value.replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1"), []);

  const maskPhone = useCallback((value: string) =>
    value.replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4,5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1"), []);

  const maskCEP = useCallback((value: string) =>
    value.replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{3})\d+?$/, "$1"), []);

  const maskCurrency = useCallback((value: string) => {
    const numeric = value.replace(/\D/g, "");
    return (parseFloat(numeric) / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }, []);

  const fetchCompanies = useCallback(async () => {
    setIsFetchingCompanies(true);
    try {
      const data = await fetchCompanyList();
      setCompanies(data.map((c) => ({ companyId: c.id, name: c.name })));
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
    const cpfRaw = form.getValues("cpf").replace(/\D/g, "");

    if (cpfRaw.length !== 11) {
      toast({ title: "Erro de validação", description: "O CPF deve ter 11 dígitos.", variant: "destructive" });
      setCpfAvailability(null);
      return;
    }

    const companyId = form.getValues("companyId");
    if (!companyId) {
      toast({
        title: "Empresa não selecionada",
        description: "Selecione uma empresa antes de verificar o CPF.",
        variant: "destructive",
      });
      setCpfAvailability(null);
      return;
    }

    setIsCheckingCPF(true);
    setCpfAvailability("checking");

    try {
      const available = await checkCpfAvailability(cpfRaw, companyId);
      if (!available) {
        toast({ title: "CPF indisponível", description: "Este CPF já está cadastrado nesta empresa.", variant: "destructive" });
        setCpfAvailability("unavailable");
      } else {
        toast({ title: "CPF disponível!", description: "Você pode usar este CPF para o registro." });
        setCpfAvailability("available");
      }
    } catch (error) {
      safeLogger.error("Erro na verificação de CPF:", error);
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
        description: "Conclua primeiro o cadastro do colaborador (Passo 1).",
        variant: "destructive",
      });
      return;
    }

    const username = form.getValues("username") ?? "";
    if (username.length < 4) {
      toast({ title: "Erro de validação", description: "O usuário deve ter pelo menos 4 caracteres.", variant: "destructive" });
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
        toast({ title: "Nome de usuário disponível!", description: "Você pode usar este nome de usuário." });
        setUsernameAvailability("available");
      }
    } catch (error) {
      safeLogger.error("Erro na verificação de username:", error);
      toast({ title: "Erro de rede", description: "Falha ao conectar com o servidor.", variant: "destructive" });
      setUsernameAvailability(null);
    } finally {
      setIsCheckingUsername(false);
    }
  }, [form, stepCompleted, toast]);

  const handleCreateEmployee = useCallback(async (data: UnifiedFormData) => {
    setIsSubmitting(true);

    if (cpfAvailability !== "available") {
      toast({ title: "Ação Pendente", description: "Verifique a disponibilidade do CPF antes de continuar.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    try {
      const salary = parseFloat(
        (data.salario ?? "").replace(/[R$\s.]/g, "").replace(",", ".")
      );
      const cpf = data.cpf.replace(/\D/g, "");
      const phone = data.telefone.replace(/\D/g, "");
      const postalCode = data.cep.replace(/\D/g, "");

      let employeeId: string;

      if (selectedType === "ADMINISTRADOR") {
        const result = await createManager({
          companyId: data.companyId,
          fullName: data.nomeCompleto,
          cpf,
          jobPosition: data.cargo,
          email: data.email,
          salary,
          phone,
          address: { postalCode, number: data.numero },
          scheduleType: data.scheduleType,
          scaleStartDate: data.scaleStartDate ?? null,
          preferredDayOff: data.preferredDayOff ?? null,
          weekendOffIndex: data.weekendOffIndex ? parseInt(data.weekendOffIndex) : null,
          fixedWorkDays: data.fixedWorkDays ?? [],
        });
        employeeId = result.employeeId;
      } else {
        const result = await createCollaborator({
          companyId: data.companyId,
          fullName: data.nomeCompleto,
          cpf,
          jobPosition: data.cargo,
          email: data.email,
          salary,
          phone,
          homeOffice: data.homeOffice === "true",
          address: { postalCode, number: data.numero },
          workStartTime: data.workStartTime ?? "08:00",
          workEndTime: data.workEndTime ?? "17:00",
          breakStartTime: data.breakStartTime ?? "12:00",
          breakEndTime: data.breakEndTime ?? "13:00",
          scheduleType: data.scheduleType,
          scaleStartDate: data.scaleStartDate ?? null,
          preferredDayOff: data.preferredDayOff ?? null,
          weekendOffIndex: data.weekendOffIndex ? parseInt(data.weekendOffIndex) : null,
          fixedWorkDays: data.fixedWorkDays ?? [],
        });
        employeeId = result.employeeId;
      }

      setSavedEmployeeId(employeeId);
      setStepCompleted(true);
      toast({
        title: "Colaborador criado!",
        description: `Registro de ${data.nomeCompleto} salvo. Prossiga para as credenciais.`,
      });
    } catch (error) {
      safeLogger.error("Erro ao criar colaborador:", error);
      toast({
        title: "Erro ao cadastrar",
        description: error instanceof Error ? error.message : "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [cpfAvailability, selectedType, toast]);

  const handleCreateUser = useCallback(async (data: UnifiedFormData) => {
    setIsSubmitting(true);

    const username = data.username ?? "";
    if (username.length < 4) {
      toast({ title: "Erro de validação", description: "O usuário deve ter pelo menos 4 caracteres.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    if (usernameAvailability !== "available") {
      toast({ title: "Ação Pendente", description: "Verifique a disponibilidade do nome de usuário.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    if (!savedEmployeeId) {
      toast({ title: "Erro de Fluxo", description: "ID do colaborador não encontrado. Reinicie o cadastro.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    try {
      await createUser({
        username,
        role: ROLE_BY_TYPE[selectedType],
        employeeId: savedEmployeeId,
      });

      toast({ title: "Cadastro Concluído!", description: `Usuário ${username} criado com sucesso!` });

      form.reset();
      setSavedEmployeeId(null);
      setStepCompleted(false);
      setUsernameAvailability(null);
      setCpfAvailability(null);
      navigate("/empresa");
    } catch (error) {
      safeLogger.error("Erro ao criar usuário:", error);
      toast({
        title: "Erro ao criar usuário",
        description: error instanceof Error ? error.message : "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [form, navigate, savedEmployeeId, selectedType, toast, usernameAvailability]);

  const onSubmit = useCallback((data: UnifiedFormData) => {
    if (!stepCompleted) {
      void handleCreateEmployee(data);
    } else {
      void handleCreateUser(data);
    }
  }, [handleCreateEmployee, handleCreateUser, stepCompleted]);

  return {
    form,
    isCto,
    selectedType,
    handleTypeChange,
    isSubmitting,
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
  };
};
