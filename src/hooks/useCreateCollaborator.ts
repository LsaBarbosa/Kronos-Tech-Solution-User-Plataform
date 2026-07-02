import { type ChangeEvent, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
import { preloadCsrfToken } from "@/service/csrf.service";
import { checkCpfAvailability, createCollaborator } from "@/service/collaborator-management.service";
import { findEmployeeByCpf } from "@/service/employee.service";
import { fetchCompanyList } from "@/service/company.service";
import { APP_PATHS } from "@/config/app-routes";
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

const schema = z.object({
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
}).refine(
  (data) => {
    if (data.scheduleType === "CUSTOM_DAYS") {
      return Array.isArray(data.fixedWorkDays) && data.fixedWorkDays.length > 0;
    }
    return true;
  },
  {
    message: 'Selecione ao menos um dia de trabalho para a escala "Dias de trabalho".',
    path: ["fixedWorkDays"],
  }
);

export type CollaboratorFormData = z.infer<typeof schema>;

export interface CompanyOption {
  companyId: string;
  companyName: string;
}

export const useCreateCollaborator = () => {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cpfAvailability, setCpfAvailability] = useState<"available" | "unavailable" | "checking" | null>(null);
  const [isCheckingCPF, setIsCheckingCPF] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [autoFilledFrom, setAutoFilledFrom] = useState<string | undefined>(undefined);
  const [faceImageBase64, setFaceImageBase64] = useState<string | undefined>(undefined);
  const [fileName, setFileName] = useState<string | undefined>(undefined);

  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingCompanies(true);
    // Carrega todas as empresas do sistema para qualquer role
    void fetchCompanyList()
      .then((list) => {
        if (cancelled) return;
        const options: CompanyOption[] = list
          .filter((c) => c.active)
          .map((c) => ({ companyId: c.id, companyName: c.name }));
        setCompanies(options);
        if (options.length === 1) setSelectedCompanyId(options[0].companyId);
      })
      .catch(() => {
        if (!cancelled) toast({ title: "Erro ao carregar empresas", variant: "destructive" });
      })
      .finally(() => {
        if (!cancelled) setIsLoadingCompanies(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const form = useForm<CollaboratorFormData>({
    resolver: zodResolver(schema),
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
    },
  });

  const selectedScheduleType = form.watch("scheduleType");

  const maskCPF = useCallback((value: string) => cpfMask(value), []);
  const maskPhone = useCallback((value: string) => phoneMask(value), []);
  const maskCEP = useCallback((value: string) => cepMask(value), []);
  const maskCurrency = useCallback((value: string) => currencyMask(value), []);

  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  const resetCpfStatus = useCallback(() => {
    setCpfAvailability(null);
    setIsAutoFilled(false);
    setAutoFilledFrom(undefined);
  }, []);

  const handleImageUpload = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = (reader.result as string).split(",")[1];
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
        title: "CPF inválido",
        description: "O CPF deve ter 11 dígitos.",
        variant: "destructive",
      });
      setCpfAvailability(null);
      return;
    }

    if (!selectedCompanyId) {
      toast({
        title: "Selecione uma empresa",
        description: "Escolha a empresa antes de verificar o CPF.",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingCPF(true);
    setCpfAvailability("checking");
    setIsAutoFilled(false);
    setAutoFilledFrom(undefined);

    try {
      // 1. Verifica se o CPF já existe na empresa selecionada (bloqueia duplicata)
      const existsInTarget = !(await checkCpfAvailability(cpf, selectedCompanyId));
      if (existsInTarget) {
        setCpfAvailability("unavailable");
        toast({
          title: "CPF já cadastrado nessa empresa",
          description: "Esse colaborador já existe na empresa selecionada.",
          variant: "destructive",
        });
        return;
      }

      // 2. Busca globalmente para preencher automaticamente
      const existing = await findEmployeeByCpf(cpf);
      if (existing) {
        const phone = (existing.phone ?? "").replace(/\D/g, "");
        form.setValue("nomeCompleto", existing.fullName);
        form.setValue("cargo", existing.jobPosition);
        form.setValue("email", existing.email);
        form.setValue("telefone", phoneMask(phone));
        if (existing.salary !== null && existing.salary !== undefined) {
          form.setValue("salario", currencyMask(String(Math.round(existing.salary * 100))));
        }
        form.setValue("homeOffice", existing.homeOffice ? "true" : "false");
        if (existing.workStartTime) form.setValue("workStartTime", existing.workStartTime);
        if (existing.workEndTime) form.setValue("workEndTime", existing.workEndTime);
        if (existing.breakStartTime) form.setValue("breakStartTime", existing.breakStartTime);
        if (existing.breakEndTime) form.setValue("breakEndTime", existing.breakEndTime);
        if (existing.scheduleType) form.setValue("scheduleType", existing.scheduleType);
        if (existing.scaleStartDate) form.setValue("scaleStartDate", existing.scaleStartDate);
        if (existing.preferredDayOff) form.setValue("preferredDayOff", existing.preferredDayOff);
        if (existing.weekendOffIndex !== null && existing.weekendOffIndex !== undefined) form.setValue("weekendOffIndex", String(existing.weekendOffIndex));
        if (existing.fixedWorkDays?.length) form.setValue("fixedWorkDays", existing.fixedWorkDays);
        if (existing.address?.postalCode) {
          form.setValue("cep", existing.address.postalCode.replace(/\D/g, "").replace(/^(\d{5})(\d{3})$/, "$1-$2"));
          form.setValue("numero", existing.address.number ?? "");
        }
        setIsAutoFilled(true);
        setAutoFilledFrom(existing.companyName);
        setCpfAvailability("available");
        toast({
          title: "Dados preenchidos automaticamente",
          description: `CPF encontrado em "${existing.companyName}". Revise os dados e salve para registrar nessa empresa.`,
        });
      } else {
        setCpfAvailability("available");
        toast({
          title: "CPF disponível",
          description: "Nenhum cadastro anterior encontrado. Preencha os dados manualmente.",
        });
      }
    } catch (error) {
      safeLogger.error("Erro ao verificar CPF:", error);
      toast({
        title: "Erro de rede",
        description: "Falha ao conectar com o servidor.",
        variant: "destructive",
      });
      setCpfAvailability(null);
    } finally {
      setIsCheckingCPF(false);
    }
  }, [form, selectedCompanyId]);

  const handleCreateEmployee = useCallback(
    async (data: CollaboratorFormData) => {
      if (isSubmitting) return false;

      if (!selectedCompanyId) {
        toast({ title: "Selecione uma empresa", description: "Escolha a empresa de destino antes de salvar.", variant: "destructive" });
        return false;
      }

      if (cpfAvailability !== "available") {
        toast({
          title: "Ação pendente",
          description: "Verifique a disponibilidade do CPF antes de continuar.",
          variant: "destructive",
        });
        return false;
      }

      setIsSubmitting(true);
      try {
        await preloadCsrfToken();
        await createCollaborator({
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
          companyId: selectedCompanyId,
        });

        const companyName = companies.find((c) => c.companyId === selectedCompanyId)?.companyName ?? "";
        toast({
          title: "Colaborador criado!",
          description: `${data.nomeCompleto} foi cadastrado${companyName ? ` em ${companyName}` : ""}.`,
        });
        navigate(APP_PATHS.listaColaboradores);
        return true;
      } catch (error) {
        safeLogger.error("Erro ao criar colaborador:", error);
        toast({
          title: "Erro ao cadastrar colaborador",
          description: error instanceof Error ? error.message : "Tente novamente mais tarde.",
          variant: "destructive",
        });
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, cpfAvailability, faceImageBase64, selectedCompanyId, companies, navigate]
  );

  const onSubmit = useCallback(
    (data: CollaboratorFormData) => {
      void handleCreateEmployee(data);
    },
    [handleCreateEmployee]
  );

  const submitEmployee = useCallback(async () => {
    let success = false;
    await form.handleSubmit(async (data) => {
      success = (await handleCreateEmployee(data)) ?? false;
    })();
    return success;
  }, [form, handleCreateEmployee]);

  return {
    form,
    isSubmitting,
    sidebarOpen,
    handleToggleSidebar,
    cpfAvailability,
    isCheckingCPF,
    isAutoFilled,
    autoFilledFrom,
    faceImageBase64,
    fileName,
    selectedScheduleType,
    maskCPF,
    maskPhone,
    maskCEP,
    maskCurrency,
    handleImageUpload,
    handleCheckCPF,
    resetCpfStatus,
    submitEmployee,
    onSubmit,
    scheduleTypes: COLLABORATOR_SCHEDULE_OPTIONS,
    daysOfWeek: COLLABORATOR_LONG_DAY_OPTIONS,
    companies,
    isLoadingCompanies,
    selectedCompanyId,
    setSelectedCompanyId,
  };
};

export type UseCreateCollaboratorReturn = ReturnType<typeof useCreateCollaborator>;
