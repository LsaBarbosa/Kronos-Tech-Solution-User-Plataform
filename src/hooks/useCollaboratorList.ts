import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchEmployeeList,
  toggleUserStatus,
  updateCollaborator,
  updateUser,
} from "@/service/collaborator-management.service";
import { listUsers } from "@/service/user.service";
import type { UserSearchData } from "@/types/user";

interface Address {
  street: string;
  number: string;
  postalCode: string;
  city: string;
  state: string;
}

interface Employee {
  employeeId: string;
  fullName: string;
  username?: string;
  maskedCpf: string;
  pis: string;
  jobPosition: string;
  email: string;
  salary: number;
  phone: string;
  address: Address;
  companyId: string;
  active: boolean;
  homeOffice: boolean;
  workStartTime?: string;
  workEndTime?: string;
  breakStartTime?: string;
  breakEndTime?: string;
  scheduleType?: string;
  scaleStartDate?: string;
  preferredDayOff?: string;
  weekendOffIndex?: number;
  fixedWorkDays?: string[];
}

interface CombinedColaborator extends Employee, UserSearchData {
  enabled?: boolean;
}

const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

type EditableValue = string | boolean | string[] | number | null | undefined;
type EditableData = Record<string, EditableValue>;

export const useCollaboratorList = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [colaboradores, setColaboradores] = useState<CombinedColaborator[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [faceImageFile, setFaceImageFile] = useState<File | null>(null);
  const [filters, setFilters] = useState({
    nome: "",
    cpf: "",
    cargo: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<EditableData>({});

  const { toast } = useToast();

  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  const fetchColaboradores = useCallback(async () => {
    setIsLoading(true);
    try {
      const isActive = !showInactive;
      const [employees, users] = await Promise.all([
        fetchEmployeeList(isActive),
        listUsers(isActive),
      ]);

      const usersByUsername = new Map<string, UserSearchData>();
      users.forEach((user) => {
        usersByUsername.set(user.username.trim().toLowerCase(), user);
      });

      const combinedData: CombinedColaborator[] = employees.map((employee: Employee) => {
        const user = employee.username
          ? usersByUsername.get(employee.username.trim().toLowerCase())
          : undefined;

        if (user) {
          return {
            ...employee,
            ...user,
            enabled: user.active,
          };
        }

        return {
          ...employee,
          userId: "N/A",
          username: "Sem Usuário",
          role: "PARTNER",
          enabled: employee.active,
          employeeId: employee.employeeId,
        } as CombinedColaborator;
      });

      setColaboradores(combinedData);
      toast({
        title: "Dados carregados com sucesso",
        description: "Lista de colaboradores atualizada.",
      });
    } catch (error) {
      console.error("Erro ao buscar colaboradores:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de colaboradores.",
        variant: "destructive",
      });
      setColaboradores([]);
    } finally {
      setIsLoading(false);
    }
  }, [showInactive, toast]);

  useEffect(() => {
    void fetchColaboradores();
  }, [fetchColaboradores]);

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFaceImageFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erro de arquivo",
        description: "Por favor, selecione um arquivo de imagem válido (JPEG, PNG, etc).",
        variant: "destructive",
      });
      setFaceImageFile(null);
      event.target.value = "";
      return;
    }

    setFaceImageFile(file);
  }, [toast]);

  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  }, []);

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }, []);

  const formatAddress = useCallback((address: Address) => {
    return `${address.street}, ${address.number} - ${address.city}/${address.state} - CEP: ${address.postalCode}`;
  }, []);

  const formatPhone = useCallback((phone: string) => {
    const cleaned = ("" + phone).replace(/\D/g, "");
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  }, []);

  const filteredColaboradores = useMemo(() => {
    return colaboradores.filter((colaborador) => {
      const matchesNome =
        filters.nome === "" ||
        colaborador.fullName?.toLowerCase().includes(filters.nome.toLowerCase()) ||
        (colaborador.username && colaborador.username.toLowerCase().includes(filters.nome.toLowerCase()));

      const matchesCargo =
        filters.cargo === "" ||
        colaborador.jobPosition?.toLowerCase().includes(filters.cargo.toLowerCase());

      return matchesNome && matchesCargo;
    });
  }, [filters, colaboradores]);

  const hasActiveFilters = Object.values(filters).some((filter) => filter !== "");

  const handleFilterChange = useCallback((filterType: string, value: string) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      nome: "",
      cpf: "",
      cargo: "",
    });
  }, []);

  const handleEditColaborador = useCallback((colaborador: CombinedColaborator) => {
    setEditingId(colaborador.employeeId);
    setEditedData({
      fullName: colaborador.fullName,
      maskedCpf: colaborador.maskedCpf,
      pis: colaborador.pis,
      jobPosition: colaborador.jobPosition,
      email: colaborador.email,
      salary: colaborador.salary,
      phone: colaborador.phone,
      postalCode: colaborador.address.postalCode,
      number: colaborador.address.number,
      username: colaborador.username,
      role: colaborador.role,
      enabled: colaborador.enabled,
      homeOffice: colaborador.homeOffice,
      workStartTime: colaborador.workStartTime,
      workEndTime: colaborador.workEndTime,
      breakStartTime: colaborador.breakStartTime,
      breakEndTime: colaborador.breakEndTime,
      scheduleType: colaborador.scheduleType,
      scaleStartDate: colaborador.scaleStartDate,
      preferredDayOff: colaborador.preferredDayOff,
      weekendOffIndex: colaborador.weekendOffIndex,
      fixedWorkDays: colaborador.fixedWorkDays || [],
    });
    setFaceImageFile(null);
  }, []);

  const handleEditedDataChange = useCallback((field: string, value: string | boolean | string[]) => {
    setEditedData((prev: EditableData) => {
      if (field === "enabled" || field === "homeOffice") {
        return { ...prev, [field]: value };
      }

      if (field === "fixedWorkDays") {
        return { ...prev, [field]: value };
      }

      if (field === "maskedCpf" || field === "postalCode" || field === "phone") {
        const sanitizedValue = (value as string).replace(/\D/g, "");
        let finalValue = sanitizedValue;

        if (field === "maskedCpf") {
          finalValue = sanitizedValue.slice(0, 11);
        } else if (field === "postalCode") {
          finalValue = sanitizedValue.slice(0, 8);
        } else if (field === "phone") {
          finalValue = sanitizedValue.slice(0, 11);
        }

        return { ...prev, [field]: finalValue };
      }

      if (field === "salary") {
        const numericValue = (value as string).replace(/[R$\s.]/g, "").replace(",", ".");
        return { ...prev, [field]: numericValue };
      }

      return { ...prev, [field]: value };
    });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditedData({});
    setFaceImageFile(null);
  }, []);

  const handleSaveColaborador = useCallback(async (colaboradorId: string) => {
    const originalColaborador = colaboradores.find((c) => c.employeeId === colaboradorId);
    if (!originalColaborador) {
      toast({
        title: "Erro",
        description: "Colaborador não encontrado para edição.",
        variant: "destructive",
      });
      return;
    }

    const editedCpf = editedData.maskedCpf ? editedData.maskedCpf.replace(/\D/g, "") : null;
    const editedCep = editedData.postalCode ? editedData.postalCode.replace(/\D/g, "") : null;
    const editedEmail = editedData.email;

    if (editedCpf && editedCpf.length !== 11) {
      toast({
        title: "Erro ao salvar",
        description: "O CPF deve conter exatamente 11 dígitos.",
        variant: "destructive",
      });
      return;
    }

    if (editedEmail && editedEmail !== originalColaborador.email && !isValidEmail(editedEmail)) {
      toast({
        title: "Erro ao salvar",
        description: "O formato do e-mail é inválido.",
        variant: "destructive",
      });
      return;
    }

    if (editedCep && editedCep.length !== 8) {
      toast({
        title: "Erro ao salvar",
        description: "O CEP deve conter exatamente 8 dígitos.",
        variant: "destructive",
      });
      return;
    }

    const cleanedPhone = editedData.phone ? editedData.phone.replace(/\D/g, "") : originalColaborador.phone.replace(/\D/g, "");
    if (editedData.phone && cleanedPhone.length !== 11) {
      toast({
        title: "Erro ao salvar",
        description: "O telefone deve conter exatamente 11 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const bodyDataEmployee: Record<string, EditableValue> = {};
      const bodyDataUser: Record<string, EditableValue> = {};

      if (editedData.fullName && editedData.fullName !== originalColaborador.fullName) {
        bodyDataEmployee.fullName = editedData.fullName;
      }
      if (editedCpf && editedCpf !== originalColaborador.maskedCpf.replace(/\D/g, "")) {
        bodyDataEmployee.cpf = editedCpf;
      }
      if (editedData.pis && editedData.pis !== originalColaborador.pis.replace(/\D/g, "")) {
        bodyDataEmployee.pis = editedData.pis;
      }
      if (editedData.jobPosition && editedData.jobPosition !== originalColaborador.jobPosition) {
        bodyDataEmployee.jobPosition = editedData.jobPosition;
      }
      if (editedData.email && editedData.email !== originalColaborador.email) {
        bodyDataEmployee.email = editedData.email;
      }
      if (editedData.salary !== undefined && editedData.salary.toString() !== originalColaborador.salary.toString()) {
        bodyDataEmployee.salary = parseFloat(editedData.salary);
      }
      if (editedData.phone && editedData.phone.replace(/\D/g, "") !== originalColaborador.phone) {
        bodyDataEmployee.phone = editedData.phone.replace(/\D/g, "");
      }
      if (editedData.homeOffice !== undefined && editedData.homeOffice !== originalColaborador.homeOffice) {
        bodyDataEmployee.homeOffice = editedData.homeOffice;
      }
      if (editedData.workStartTime && editedData.workStartTime !== originalColaborador.workStartTime) {
        bodyDataEmployee.workStartTime = editedData.workStartTime;
      }
      if (editedData.workEndTime && editedData.workEndTime !== originalColaborador.workEndTime) {
        bodyDataEmployee.workEndTime = editedData.workEndTime;
      }
      if (editedData.breakStartTime && editedData.breakStartTime !== originalColaborador.breakStartTime) {
        bodyDataEmployee.breakStartTime = editedData.breakStartTime;
      }
      if (editedData.breakEndTime && editedData.breakEndTime !== originalColaborador.breakEndTime) {
        bodyDataEmployee.breakEndTime = editedData.breakEndTime;
      }
      if (editedData.scheduleType !== originalColaborador.scheduleType) bodyDataEmployee.scheduleType = editedData.scheduleType;
      if (editedData.scaleStartDate !== originalColaborador.scaleStartDate) bodyDataEmployee.scaleStartDate = editedData.scaleStartDate;
      if (editedData.preferredDayOff !== originalColaborador.preferredDayOff) bodyDataEmployee.preferredDayOff = editedData.preferredDayOff;
      if (editedData.weekendOffIndex !== originalColaborador.weekendOffIndex) bodyDataEmployee.weekendOffIndex = editedData.weekendOffIndex ? parseInt(editedData.weekendOffIndex) : null;
      if (JSON.stringify(editedData.fixedWorkDays) !== JSON.stringify(originalColaborador.fixedWorkDays)) bodyDataEmployee.fixedWorkDays = editedData.fixedWorkDays;

      if (faceImageFile) {
        try {
          const base64Image = await fileToBase64(faceImageFile);
          bodyDataEmployee.faceImageBase64 = base64Image;
          toast({
            title: "Imagem detectada",
            description: "Nova imagem de face será enviada para atualização do reconhecimento.",
          });
        } catch (error) {
          throw new Error("Falha ao processar a imagem de face.");
        }
      }

      const hasAddressChange =
        (editedCep && editedCep !== originalColaborador.address.postalCode) ||
        (editedData.number && editedData.number !== originalColaborador.address.number);

      if (hasAddressChange) {
        bodyDataEmployee.address = {
          postalCode: editedCep || originalColaborador.address.postalCode,
          number: editedData.number || originalColaborador.address.number,
        };
      }

      if (editedData.username && editedData.username !== originalColaborador.username) {
        bodyDataUser.username = editedData.username;
      }
      if (editedData.role && editedData.role !== originalColaborador.role) {
        bodyDataUser.role = editedData.role;
      }
      if (editedData.enabled !== undefined && editedData.enabled !== originalColaborador.enabled) {
        bodyDataUser.enabled = editedData.enabled;
      }

      if (Object.keys(bodyDataEmployee).length === 0 && Object.keys(bodyDataUser).length === 0 && !faceImageFile) {
        toast({
          title: "Nenhuma alteração",
          description: "Nenhum dado foi alterado para ser salvo.",
        });
        setEditingId(null);
        setEditedData({});
        return;
      }

      const promises: Array<Promise<unknown>> = [];

      if (Object.keys(bodyDataEmployee).length > 0 || faceImageFile) {
        promises.push(updateCollaborator(colaboradorId, bodyDataEmployee));
      }

      if (Object.keys(bodyDataUser).length > 0) {
        promises.push(updateUser(originalColaborador.userId, bodyDataUser));
      }

      await Promise.all(promises);
      await fetchColaboradores();

      toast({
        title: "Sucesso",
        description: "Dados do colaborador atualizados.",
      });
    } catch (error) {
      console.error("Erro ao salvar colaborador:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setEditingId(null);
      setEditedData({});
      setFaceImageFile(null);
    }
  }, [colaboradores, editedData, faceImageFile, fetchColaboradores, fileToBase64, toast]);

  const handleToggleUserStatus = useCallback(async (userId: string, currentStatus: boolean) => {
    if (!userId || userId === "N/A") {
      toast({
        title: "Ação Indisponível",
        description: "Não foi encontrado um usuário vinculado a este colaborador.",
        variant: "destructive",
      });
      return;
    }

    try {
      await toggleUserStatus(userId);
      setColaboradores((prevList) => prevList.filter((colab) => colab.userId !== userId));

      toast({
        title: "Sucesso",
        description: `Usuário ${currentStatus ? "desativado" : "ativado"} com sucesso.`,
      });

      void fetchColaboradores();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível alterar o status do usuário.",
        variant: "destructive",
      });
    }
  }, [fetchColaboradores, toast]);

  return {
    sidebarOpen,
    handleToggleSidebar,
    colaboradores,
    showInactive,
    setShowInactive,
    isLoading,
    faceImageFile,
    filters,
    editingId,
    editedData,
    filteredColaboradores,
    hasActiveFilters,
    handleFilterChange,
    clearFilters,
    handleEditColaborador,
    handleSaveColaborador,
    handleCancelEdit,
    handleEditedDataChange,
    handleToggleUserStatus,
    handleFileChange,
    formatCurrency,
    formatAddress,
    formatPhone,
  };
};
