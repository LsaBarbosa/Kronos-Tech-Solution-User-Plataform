import { useState, useEffect, useMemo, useCallback } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  IdCard,
  Search,
  X,
  Edit,
  Save,
  XCircle,
  // Trash2, // Removido
  Power, // NOVO: Importado para representar Ativar/Desativar
  UserCircle,
  Sparkles,
  Camera,
  Clock,
  FileText,
  ArrowRight,
  CalendarDays,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

// Importações adicionais
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { API_BASE_URL, apiFetch } from "@/config/api";
import { Switch } from "@/components/ui/switch";

const SCHEDULE_TYPES = [
    { value: "TRADITIONAL_5X2", label: "Tradicional 5x2" },
    { value: "SIX_BY_ONE_FIXED", label: "6x1 com Folga Fixa" },
    { value: "ROTATING_12X36", label: "Plantão 12x36" },
    { value: "ROTATING_24X72", label: "Plantão 24x72" },
    { value: "SIX_BY_ONE_TWO_WEEKENDS", label: "6x1 + 2 FDS" },
    { value: "SIX_BY_ONE_ONE_WEEKEND", label: "6x1 + 1 FDS" }
];

const DAYS_OF_WEEK = [
    { value: "MONDAY", label: "Seg" },
    { value: "TUESDAY", label: "Ter" },
    { value: "WEDNESDAY", label: "Qua" },
    { value: "THURSDAY", label: "Qui" },
    { value: "FRIDAY", label: "Sex" },
    { value: "SATURDAY", label: "Sáb" },
    { value: "SUNDAY", label: "Dom" }
];

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

 interface UserData {
  userId: string;
  username: string;
  role: "PARTNER" | "MANAGER";
  active: boolean; // Adicione active, pois é o que vem da API
  enabled?: boolean; // Mantenha enabled como opcional se quiser usar na UI
  employeeId: string;
}

interface CombinedColaborator extends Employee, UserData { }

const isValidEmail = (email: string) => {
  return /\S+@\S+\.\S+/.test(email);
};

const ListaColaboradores = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [colaboradores, setColaboradores] = useState<CombinedColaborator[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const [isLoading, setIsLoading] = useState(true);
  const [faceImageFile, setFaceImageFile] = useState<File | null>(null);
  const [filters, setFilters] = useState({
    nome: "",
    cpf: "",
    cargo: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<any>({});

  const { toast } = useToast();

  const fetchColaboradores = async () => {
    setIsLoading(true);
    try {

      const isActive = !showInactive;

      const [employeesResponse, usersResponse] = await Promise.all([
        apiFetch(`${API_BASE_URL}employee?active=${isActive}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            
          },
        }),
        apiFetch(`${API_BASE_URL}users/search`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            
          },
        }),
      ]);

      if (!employeesResponse.ok || !usersResponse.ok) {
        throw new Error("Falha ao buscar os dados dos colaboradores.");
      }

      const employeesData = await employeesResponse.json();
      const usersData = await usersResponse.json();

      const employees = employeesData.employees || [];
      const users = usersData.users || [];

      const usersMap = new Map<string, UserData>();
      users.forEach((user: UserData) => usersMap.set(user.employeeId, user));

      const combinedData: CombinedColaborator[] = employees
        .map((employee: Employee) => {
          const user = usersMap.get(employee.employeeId);
          
          // Lógica de Left Join: Se tiver user, usa os dados. Se não, usa dados parciais/padrão.
          if (user) {
            return {
              ...employee,
              ...user,
              // CORREÇÃO CRÍTICA: Mapeia 'active' da API para 'enabled' se sua UI usa 'enabled'
              enabled: user.active !== undefined ? user.active : employee.active, 
            };
          } else {
            // Se não houver usuário correspondente, retornamos o funcionário mesmo assim
            // Definimos valores padrão para não quebrar a UI
            return {
              ...employee,
              userId: "N/A",
              username: "Sem Usuário", // Evita crash no toLowerCase() do filtro
              role: "PARTNER", // Valor padrão seguro
              enabled: employee.active,
              employeeId: employee.employeeId
            } as CombinedColaborator;
          }
        })
        .filter(Boolean) as CombinedColaborator[]; // O filter continua útil caso algo retorne null explicitamente
        
      setColaboradores(combinedData);

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
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erro de arquivo",
          description: "Por favor, selecione um arquivo de imagem válido (JPEG, PNG, etc).",
          variant: "destructive",
        });
        setFaceImageFile(null);
        event.target.value = '';
        return;
      }
      setFaceImageFile(file);
    } else {
      setFaceImageFile(null);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  useEffect(() => {
    fetchColaboradores();
  }, [showInactive]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatAddress = (address: Address) => {
    return `${address.street}, ${address.number} - ${address.city}/${address.state} - CEP: ${address.postalCode}`;
  };

  const formatPhone = (phone: string) => {
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  const filteredColaboradores = useMemo(() => {
    return colaboradores.filter((colaborador) => {
      const matchesNome =
        filters.nome === "" ||
        colaborador.fullName?.toLowerCase().includes(filters.nome.toLowerCase()) ||
        // Adiciona verificação de segurança (?.) ou fallback
        (colaborador.username && colaborador.username.toLowerCase().includes(filters.nome.toLowerCase()));

      const matchesCargo =
        filters.cargo === "" ||
        colaborador.jobPosition?.toLowerCase().includes(filters.cargo.toLowerCase());
      return matchesNome && matchesCargo;
    });
  }, [filters, colaboradores]);

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      nome: "",
      cpf: "",
      cargo: "",
    });
  };

  const hasActiveFilters = Object.values(filters).some((filter) => filter !== "");

  const handleEditColaborador = (colaborador: CombinedColaborator) => {
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
      workEndTime:  colaborador.workEndTime,
      breakStartTime:  colaborador.breakStartTime,
      breakEndTime: colaborador.breakEndTime,
      scheduleType: colaborador.scheduleType,
      scaleStartDate: colaborador.scaleStartDate,
      preferredDayOff: colaborador.preferredDayOff,
      weekendOffIndex: colaborador.weekendOffIndex,
      fixedWorkDays: colaborador.fixedWorkDays || []
});
    setFaceImageFile(null);
  };

  const handleSaveColaborador = async (colaboradorId: string) => {
    const originalColaborador = colaboradores.find(
      (c) => c.employeeId === colaboradorId
    );
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

    if (editedCpf && (editedCpf.length !== 11)) {
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

    if (editedCep && (editedCep.length !== 8)) {
      toast({
        title: "Erro ao salvar",
        description: "O CEP deve conter exatamente 8 dígitos.",
        variant: "destructive",
      });
      return;
    }

    const cleanedPhone = editedData.phone ? editedData.phone.replace(/\D/g, '') : originalColaborador.phone.replace(/\D/g, '');
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

      const bodyDataEmployee: { [key: string]: any } = {};
      const bodyDataUser: { [key: string]: any } = {};

      if (editedData.fullName && editedData.fullName !== originalColaborador.fullName) {
        bodyDataEmployee.fullName = editedData.fullName;
      }
      if (editedCpf && editedCpf !== originalColaborador.maskedCpf.replace(/\D/g, "")) {
        bodyDataEmployee.cpf = editedCpf;
      }
       if (editedData.pis && editedData.pis !== originalColaborador.pis.replace(/\D/g, "")) {
        bodyDataEmployee.cpf = editedCpf;
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
        } catch (e) {
          throw new Error("Falha ao processar a imagem de face.");
        }
      }
      const hasAddressChange =
        (editedCep &&
          editedCep !== originalColaborador.address.postalCode) ||
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

      if (Object.keys(bodyDataEmployee).length === 0 && Object.keys(bodyDataUser).length === 0) {
        if (!faceImageFile) {
          toast({
            title: "Nenhuma alteração",
            description: "Nenhum dado foi alterado para ser salvo.",
          });
          setEditingId(null);
          setEditedData({});
          setIsLoading(false);
          return;
        }
      }

      const promises = [];

      if (Object.keys(bodyDataEmployee).length > 0 || faceImageFile) {
        promises.push(
          apiFetch(`${API_BASE_URL}employee/manager/update-employee/${colaboradorId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
                credentials: "include",
            body: JSON.stringify(bodyDataEmployee),
          })
        );
      }

      if (Object.keys(bodyDataUser).length > 0) {
        promises.push(
          apiFetch(`${API_BASE_URL}users/search/${originalColaborador.userId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
                credentials: "include",
            body: JSON.stringify(bodyDataUser),
          })
        );
      }

      await Promise.all(promises);
      await fetchColaboradores();

      toast({ title: "Sucesso", description: "Dados do colaborador atualizados." });
    } catch (error: any) {
      console.error("Erro ao salvar colaborador:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setEditingId(null);
      setEditedData({});
      setFaceImageFile(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedData({});
    setFaceImageFile(null);
  };

  const handleEditedDataChange = (field: string, value: string | boolean) => {
    setEditedData((prev: any) => {
      if (field === "enabled" || field === "homeOffice") {
        return { ...prev, [field]: value };
      }

      if (field === "maskedCpf" || field === "postalCode" || field === "phone") {
        const sanitizedValue = (value as string).replace(/\D/g, '');
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
  };

  // --------------------------------------------------------
  // NOVA FUNÇÃO: TOGGLE ACTIVATE (Substitui handleDeleteUser)
  // --------------------------------------------------------
// ... (código anterior mantido)

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    // 1. Verificação de segurança (mantida da etapa anterior)
    if (!userId || userId === "N/A") {
      toast({
        title: "Ação Indisponível",
        description: "Não foi encontrado um usuário vinculado a este colaborador.",
        variant: "destructive",
      });
      return;
    }

    try {

      // Chamada à API
      const response = await apiFetch(`${API_BASE_URL}users/toggle-activate/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          
        },
      });

      if (!response.ok) {
        let errorMessage = "Falha ao alterar status.";
        try {
          const errorData = await response.json();
          if (errorData.detail) errorMessage = errorData.detail;
        } catch {
          // no-op
        }
        throw new Error(errorMessage);
      }

      // --- PONTO DA CORREÇÃO ---
      
      // 2. Atualiza a lista visualmente IMEDIATAMENTE (Remove o card da tela)
      // Como estamos alternando o status, ele não deve mais pertencer à lista atual (seja ela de ativos ou inativos).
      setColaboradores((prevList) => prevList.filter((colab) => colab.userId !== userId));

      const actionText = currentStatus ? "desativado" : "ativado";
      toast({
        title: "Sucesso",
        description: `Usuário ${actionText} com sucesso.`,
      });

      // 3. Atualiza os dados em segundo plano para garantir consistência total
      // Não usamos 'await' aqui propositalmente para não travar a UI, pois visualmente já resolvemos acima.
      fetchColaboradores();

    } catch (error: any) {
      console.error("Erro ao alterar status:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível alterar o status do usuário.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Animado... */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background: 'linear-gradient(-45deg, hsl(var(--black-primary)), hsl(var(--primary)), hsl(var(--black-primary)), hsl(var(--primary)))',
            backgroundSize: '400% 400%',
            animation: 'gradient-flow 15s ease-in-out infinite'
          }}
        />
        {/* ... (restante do background shapes) ... */}
      </div>

      <Sidebar isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={handleToggleSidebar} />

        <div className="relative z-10 min-h-screen pt-20 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 text-center md:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
                Lista de Colaboradores
              </h1>
              <p className="text-muted-foreground text-lg">
                Gerencie e visualize todos os colaboradores da empresa
              </p>
            </div>

            {/* Filtros */}
            <Card className="border-l-4 border-l-primary shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" />
                  Filtros de Busca
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="filter-nome">Nome</Label>
                    <Input
                      id="filter-nome"
                      placeholder="Buscar por nome ou usuário..."
                      value={filters.nome}
                      onChange={(e) => handleFilterChange("nome", e.target.value)}
                      className="focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="filter-cargo">Cargo</Label>
                    <Input
                      id="filter-cargo"
                      placeholder="Buscar por cargo..."
                      value={filters.cargo}
                      onChange={(e) => handleFilterChange("cargo", e.target.value)}
                      className="focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2 flex flex-col justify-end">
                  <div className="flex items-center justify-between border p-2 rounded-md bg-background/50">
                    <Label htmlFor="status-toggle" className="cursor-pointer flex flex-col">
                      <span className="font-semibold">Status de Visualização</span>
                      <span className="text-xs text-muted-foreground">
                        {showInactive ? "Exibindo Inativos" : "Exibindo Ativos"}
                      </span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="status-toggle"
                        checked={showInactive}
                        onCheckedChange={setShowInactive}
                        className="data-[state=checked]:bg-destructive"
                      />
                    </div>
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {filteredColaboradores.length} de {colaboradores.length}{" "}
                      colaboradores
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Limpar Filtros
                    </Button>
                  </div>
                )}
              </CardContent>
              <div className="mb-2"></div>
              {/* Stats */}
              <div className="mb-8 ml-6">
                <Card className="w-fit">
                  <CardContent className="flex items-center gap-2 p-4">
                    <User className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {hasActiveFilters ? "Colaboradores encontrados:" : "Total de colaboradores:"}
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                    >
                      {hasActiveFilters ? filteredColaboradores.length : colaboradores.length}
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            </Card>

            <div className="mb-4"></div>
            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="hover:shadow-lg transition-all duration-300 group border-l-4 border-l-primary/20">
                    <CardHeader className="pb-3">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                filteredColaboradores.map((colaborador) => (
                  <Card
                    key={colaborador.employeeId}
                    className="hover:shadow-lg transition-all duration-300 group border-l-4 border-l-primary/20 hover:border-l-primary"
                  >
                    <CardHeader className="pb-3 relative">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {editingId === colaborador.employeeId ? (
                            <div className="space-y-2">
                              <Input
                                value={editedData.fullName || ""}
                                onChange={(e) => handleEditedDataChange("fullName", e.target.value)}
                                className="text-xl font-semibold focus:border-primary"
                                placeholder="Nome completo"
                              />
                              <Input
                                value={editedData.jobPosition || ""}
                                onChange={(e) =>
                                  handleEditedDataChange("jobPosition", e.target.value)
                                }
                                className="focus:border-primary"
                                placeholder="Cargo"
                              />
                            </div>
                          ) : (
                            <>
                              <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300 flex items-center gap-2">
                                <User className="w-5 h-5" />
                                {colaborador.fullName}
                                {!colaborador.active && (
                                  <Badge variant="destructive" className="ml-2 text-xs px-2 py-0.5 h-5">
                                    Inativo
                                  </Badge>
                                )}
                              </CardTitle>
                              <Badge className="w-fit bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 mt-2">
                                {colaborador.jobPosition}
                              </Badge>
                            </>
                          )}
                        </div>

                        {/* Botões de Ação */}
                        {editingId === colaborador.employeeId ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveColaborador(colaborador.employeeId)}
                              className="p-2 text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-all duration-200 hover:scale-110"
                              title="Salvar alterações"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all duration-200 hover:scale-110"
                              title="Cancelar edição"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditColaborador(colaborador)}
                              className="p-2 text-primary hover:text-primary hover:bg-primary/10 rounded-full transition-all duration-200 hover:scale-110 group-hover:shadow-sm"
                              title="Editar colaborador"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {/* ALERT DIALOG DO TOGGLE */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button
                                  // Muda a cor e ícone baseados no status.
                                  // Se ativo (clicar para desativar) -> hover vermelho.
                                  // Se inativo (clicar para ativar) -> hover verde.
                                  className={`p-2 text-muted-foreground rounded-full transition-all duration-200 hover:scale-110 
                                    ${colaborador.active
                                      ? "hover:text-destructive hover:bg-destructive/10"
                                      : "hover:text-green-600 hover:bg-green-100"
                                    }`}
                                  title={colaborador.active ? "Desativar colaborador" : "Ativar colaborador"}
                                >
                                  {/* Ícone Power para representar o Toggle */}
                                  <Power className="w-4 h-4" />
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar alteração de status</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Você tem certeza que deseja <strong>{colaborador.active ? "DESATIVAR" : "ATIVAR"}</strong> o funcionário{" "}
                                    <strong>{colaborador.fullName}</strong>?
                                    <br />
                                    <span className="text-sm text-muted-foreground block mt-2">
                                      {colaborador.active
                                        ? "O usuário perderá acesso ao sistema."
                                        : "O usuário recuperará acesso ao sistema."}
                                    </span>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleToggleUserStatus(colaborador.userId, colaborador.active)}
                                    className={`${colaborador.active
                                      ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" // Botão vermelho para desativar
                                      : "bg-green-600 hover:bg-green-700 text-white" // Botão verde para ativar
                                      }`}
                                  >
                                    {colaborador.active ? "Desativar" : "Ativar"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                          </div>
                        )}
                      </div>
                    </CardHeader>
                    {/* Conteúdo do Card (Mantido igual) */}
                    <CardContent className="space-y-4">
                      {/* ... (Conteúdo de exibição) ... */}
                      {editingId === colaborador.employeeId ? (
                        <>
                          <div className="flex items-center gap-3 text-sm">
                            <UserCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground w-16">Usuário:</span>
                            <Input
                              value={editedData.username || ""}
                              onChange={(e) => handleEditedDataChange("username", e.target.value)}
                              className="flex-1 h-8 focus:border-primary"
                              placeholder="Nome de usuário"
                            />
                          </div>
                          {/* Role */}
                          <div className="flex items-center gap-3 text-sm">
                            <Sparkles className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground w-16">Perfil:</span>
                            <Select
                              value={editedData.role}
                              onValueChange={(value) => handleEditedDataChange("role", value)}
                            >
                              <SelectTrigger className="flex-1 h-8 focus:border-primary">
                                <SelectValue placeholder="Selecione o perfil" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="MANAGER">Administrador</SelectItem>
                                <SelectItem value="PARTNER">Colaborador</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {/* Enabled Switch */}
                          <div className="flex items-center gap-3 text-sm">
                            <Label htmlFor="enabled-toggle" className="text-muted-foreground w-16">Status Ativo:</Label>
                            <div className="flex-1 flex items-center justify-between">
                              <span className="font-medium text-sm">{editedData.enabled ? 'Ativo' : 'Inativo'}</span>
                              <Switch
                                id="enabled-toggle"
                                checked={editedData.enabled}
                                onCheckedChange={(value) => handleEditedDataChange("enabled", value)}
                              />
                            </div>
                          </div>

                          <div className="pt-2 border-t border-dashed">
                                <Label className="text-xs font-bold text-muted-foreground uppercase flex gap-1 items-center mb-2"><CalendarDays className="w-3 h-3"/> Escala de Trabalho</Label>
                                
                                <div className="space-y-2">
                                    <Select value={editedData.scheduleType} onValueChange={(val) => handleEditedDataChange("scheduleType", val)}>
                                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Tipo de Escala" /></SelectTrigger>
                                        <SelectContent>
                                            {SCHEDULE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>

                                    {/* Condicionais de Escala */}
                                 {(editedData.scheduleType === "ROTATING_12X36" || editedData.scheduleType === "ROTATING_24X72") && (
                                                <div className="space-y-1">
                                                    <Label className="text-[10px]">Data Início Ciclo</Label>
                                                    <Input type="date" value={editedData.scaleStartDate || ""} onChange={(e) => handleEditedDataChange("scaleStartDate", e.target.value)} className="h-8 text-xs" />
                                                </div>
                                            )}

                                            {/* Select de Folga Fixa para 6x1 */}
                                            {editedData.scheduleType?.includes("SIX_BY_ONE") && (
                                                <div className="space-y-1">
                                                    <Label className="text-[10px]">Dia da folga fixa</Label>
                                                    <Select value={editedData.preferredDayOff} onValueChange={(val) => handleEditedDataChange("preferredDayOff", val)}>
                                                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecione o dia" /></SelectTrigger>
                                                        <SelectContent>{DAYS_OF_WEEK.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                    {editedData.scheduleType === "TRADITIONAL_5X2" && (
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {DAYS_OF_WEEK.map((day) => (
                                                <div key={day.value} className="flex items-center space-x-1">
                                                    <Checkbox 
                                                        id={`day-${day.value}`}
                                                        checked={editedData.fixedWorkDays?.includes(day.value)}
                                                        onCheckedChange={(checked) => {
                                                            const current = editedData.fixedWorkDays || [];
                                                            const updated = checked ? [...current, day.value] : current.filter((d: string) => d !== day.value);
                                                            handleEditedDataChange("fixedWorkDays", updated);
                                                        }}
                                                    />
                                                    <label htmlFor={`day-${day.value}`} className="text-[10px] cursor-pointer">{day.label.substring(0, 3)}</label>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                           {/* Home Office */}
                        <div className="flex items-center gap-3 text-sm">
                          <Label htmlFor="home-office-toggle" className="text-muted-foreground w-16">Home Office:</Label>
                          <div className="flex-1 flex items-center justify-between">
                            <span className="font-medium text-sm">{editedData.homeOffice ? 'Sim' : 'Não (Local Físico)'}</span>
                            <Switch
                              id="home-office-toggle"
                              checked={editedData.homeOffice}
                              onCheckedChange={(value) => handleEditedDataChange("homeOffice", value)}
                            />
                          </div>
                        </div>

                          {/* Image Upload */}
                        <div className="space-y-2 pt-4 border-t border-dashed">
                          <Label htmlFor="face-image-upload" className="text-muted-foreground flex items-center gap-2">
                             <Camera className="w-4 h-4" />
                             Nova Imagem de Face (Opcional):
                          </Label>
                          <Input
                            id="face-image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="flex-1 h-10 focus:border-primary file:text-sm file:font-semibold"
                          />
                          <p className="text-xs text-muted-foreground">
                            {faceImageFile ? `Arquivo selecionado: ${faceImageFile.name}` : 'Selecione uma nova imagem.'}
                          </p>
                        </div>
                          {/* CPF, Email, Phone, Salary, Address Inputs... (Mantidos) */}
                          <div className="flex items-center gap-3 text-sm">
                            <IdCard className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground w-16">CPF:</span>
                            <Input
                              type="tel"
                              value={editedData.maskedCpf || ""}
                              onChange={(e) => handleEditedDataChange("maskedCpf", e.target.value)}
                              className="flex-1 h-8 focus:border-primary"
                              placeholder="CPF"
                              maxLength={11}
                            />
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground w-16">Email:</span>
                            <Input
                              type="email"
                              value={editedData.email || ""}
                              onChange={(e) => handleEditedDataChange("email", e.target.value)}
                              className="flex-1 h-8 focus:border-primary"
                            />
                          </div>
                           <div className="flex items-center gap-3 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground w-16">Telefone:</span>
                          <Input
                            type="tel"
                            value={editedData.phone || ""}
                            onChange={(e) => handleEditedDataChange("phone", e.target.value)}
                            className="flex-1 h-8 focus:border-primary"
                            placeholder="Telefone"
                            maxLength={11}
                          />
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground w-16">Salário:</span>
                          <Input
                            type="number"
                            value={editedData.salary || ""}
                            onChange={(e) => handleEditedDataChange("salary", e.target.value)}
                            className="flex-1 h-8 focus:border-primary"
                          />
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div className="flex-1 space-y-2">
                            <div className="flex gap-2">
                              <Input
                                type="tel"
                                value={editedData.postalCode || ""}
                                onChange={(e) => handleEditedDataChange("postalCode", e.target.value)}
                                className="flex-1 h-8 focus:border-primary"
                                placeholder="CEP"
                                maxLength={8}
                              />
                              <Input
                                value={editedData.number || ""}
                                onChange={(e) => handleEditedDataChange("number", e.target.value)}
                                className="flex-1 h-8 focus:border-primary"
                                placeholder="Número"
                              />
                            </div>
                          </div>
                          </div>
                          {/* --- NOVA SEÇÃO: JORNADA DE TRABALHO --- */}
                        <div className="pt-4 pb-2 border-t border-dashed">
                          <Label className="text-muted-foreground flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider">
                            <Clock className="w-4 h-4" /> Jornada de Trabalho (Contratual)
                          </Label>
                          
                          <div className="grid grid-cols-2 gap-3">
                            {/* Entrada */}
                            <div className="space-y-1">
                              <span className="text-[10px] text-muted-foreground uppercase font-bold">Entrada</span>
                              <Input
                                type="time"
                                value={editedData.workStartTime || "08:00"}
                                onChange={(e) => handleEditedDataChange("workStartTime", e.target.value)}
                                className="h-8 text-sm focus:border-primary"
                              />
                            </div>

                            {/* Saída para Almoço */}
                            <div className="space-y-1">
                              <span className="text-[10px] text-muted-foreground uppercase font-bold">Saída Almoço</span>
                              <Input
                                type="time"
                                value={editedData.breakStartTime || "12:00"}
                                onChange={(e) => handleEditedDataChange("breakStartTime", e.target.value)}
                                className="h-8 text-sm focus:border-primary"
                              />
                            </div>

                            {/* Volta do Almoço */}
                            <div className="space-y-1">
                              <span className="text-[10px] text-muted-foreground uppercase font-bold">Volta Almoço</span>
                              <Input
                                type="time"
                                value={editedData.breakEndTime || "13:00"}
                                onChange={(e) => handleEditedDataChange("breakEndTime", e.target.value)}
                                className="h-8 text-sm focus:border-primary"
                              />
                            </div>

                            {/* Saída Final */}
                            <div className="space-y-1">
                              <span className="text-[10px] text-muted-foreground uppercase font-bold">Saída</span>
                              <Input
                                type="time"
                                value={editedData.workEndTime || "17:00"}
                                onChange={(e) => handleEditedDataChange("workEndTime", e.target.value)}
                                className="h-8 text-sm focus:border-primary"
                              />
                            </div>
                          </div>
                        </div>
                        

                        </>
                      ) : (
                      <>
  {/* --- 1. CABEÇALHO: Identificação e Badges --- */}
  <div className="flex justify-between items-start mb-4">
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <UserCircle className="w-5 h-5 text-primary" />
        <span className="font-bold text-base text-foreground tracking-tight">
          {colaborador.username}
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="w-3 h-3" />
        <span className="uppercase font-medium tracking-wide">
          {colaborador.role === 'MANAGER' ? 'Administrador' : colaborador.role === 'PARTNER' ? 'Colaborador' : colaborador.role}
        </span>
      </div>
    </div>

    
    <div className="flex flex-col items-end gap-1.5">
       {/* Badge Home Office */}
       <Badge variant="outline" className={colaborador.homeOffice 
          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] px-2 h-5 font-semibold" 
          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 text-[10px] px-2 h-5 font-semibold"}>
          {colaborador.homeOffice ? 'Remoto' : 'Presencial'}
       </Badge>
       
       {/* Badge Face ID */}
       <Badge variant="secondary" className="text-[10px] px-2 h-5 gap-1 bg-primary/5 text-primary border border-primary/10 font-medium">
          <Camera className="w-3 h-3" /> Face ID
       </Badge>
    </div>
  </div>
  {/* Badge da Escala */}
                            <div className="flex justify-between items-center bg-muted/40 p-2 rounded text-xs">
                                <span className="font-semibold text-muted-foreground flex items-center gap-1"><CalendarDays className="w-3 h-3"/> Escala:</span>
                                <span className="font-medium text-primary">
                                    {SCHEDULE_TYPES.find(t => t.value === colaborador.scheduleType)?.label || "Padrão"}
                                </span>
                            </div>
                            
                            {/* Detalhes da Escala (Resumo) */}
                            {colaborador.preferredDayOff && (
                                <div className="text-xs flex gap-2"><span className="text-muted-foreground">Folga:</span> <span>{DAYS_OF_WEEK.find(d => d.value === colaborador.preferredDayOff)?.label}</span></div>
                            )}

  {/* --- 2. DADOS PROFISSIONAIS (Grid) --- */}
  <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-lg border border-border/50 mb-4">
    {/* CPF */}
    <div className="space-y-0.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
        <IdCard className="w-3 h-3" /> CPF
      </span>
      <p className="font-mono text-xs font-medium text-foreground">{colaborador.maskedCpf}</p>
    </div>

    {/* PIS (Novo Campo) */}
    <div className="space-y-0.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
        <FileText className="w-3 h-3" /> PIS
      </span>
      <p className="font-mono text-xs font-medium text-muted-foreground">
        {colaborador.pis || "—"}
      </p>
    </div>

    {/* Salário */}
    <div className="col-span-2 pt-2 mt-1 border-t border-border/50 flex justify-between items-center">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
        <DollarSign className="w-3 h-3" /> Salário Base
      </span>
      <span className="font-bold text-primary text-sm">
        {formatCurrency(colaborador.salary)}
      </span>
    </div>
  </div>

  {/* --- 3. JORNADA DE TRABALHO (Ticket Style) --- */}
  <div className="mb-4">
    <div className="flex items-center gap-2 mb-2">
      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Jornada Contratual</span>
    </div>
    
    <div className="flex items-stretch text-xs border rounded-md overflow-hidden shadow-sm bg-background">
      {/* Entrada */}
      <div className="flex-1 bg-emerald-500/5 p-2 border-r flex flex-col items-center justify-center gap-0.5">
        <span className="text-[9px] text-muted-foreground uppercase font-bold">Entrada</span>
        <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
          {colaborador.workStartTime || "--:--"}
        </span>
      </div>
      
      {/* Intervalo */}
      <div className="flex-[1.4] bg-muted/30 p-2 border-r flex flex-col items-center justify-center gap-0.5">
        <span className="text-[9px] text-muted-foreground uppercase font-bold">Intervalo</span>
        <span className="font-medium text-muted-foreground flex items-center gap-1.5">
          {colaborador.breakStartTime || "--:--"} 
          <ArrowRight className="w-3 h-3 opacity-40" /> 
          {colaborador.breakEndTime || "--:--"}
        </span>
      </div>

      {/* Saída */}
      <div className="flex-1 bg-red-500/5 p-2 flex flex-col items-center justify-center gap-0.5">
        <span className="text-[9px] text-muted-foreground uppercase font-bold">Saída</span>
        <span className="font-bold text-red-700 dark:text-red-400 text-sm">
          {colaborador.workEndTime || "--:--"}
        </span>
      </div>
    </div>
  </div>

  {/* --- 4. CONTATO E ENDEREÇO (Lista Compacta) --- */}
  <div className="space-y-2.5">
    {/* Email */}
    <div className="flex items-center gap-3 text-sm group">
      <div className="w-7 h-7 rounded-full bg-background border flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/30 transition-colors">
        <Mail className="w-3.5 h-3.5" />
      </div>
      <span className="font-medium truncate text-foreground/80 text-xs sm:text-sm">{colaborador.email}</span>
    </div>

    {/* Telefone */}
    <div className="flex items-center gap-3 text-sm group">
      <div className="w-7 h-7 rounded-full bg-background border flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/30 transition-colors">
        <Phone className="w-3.5 h-3.5" />
      </div>
      <span className="font-medium text-foreground/80 text-xs sm:text-sm">{formatPhone(colaborador.phone)}</span>
    </div>

    {/* Endereço */}
    <div className="flex items-start gap-3 text-sm group pt-1">
      <div className="w-7 h-7 rounded-full bg-background border flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/30 transition-colors flex-shrink-0">
        <MapPin className="w-3.5 h-3.5" />
      </div>
      <p className="font-medium text-xs text-muted-foreground leading-relaxed py-1">
        {formatAddress(colaborador.address)}
      </p>
    </div>
  </div>
</>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            {/* Empty States (Mantidos) */}
            {!isLoading && filteredColaboradores.length === 0 && colaboradores.length > 0 && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum colaborador encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  Nenhum colaborador corresponde aos critérios de busca aplicados.
                </p>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Limpar Filtros
                </Button>
              </div>
            )}
             {!isLoading && colaboradores.length === 0 && (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum colaborador cadastrado</h3>
              <p className="text-muted-foreground">
                Não há colaboradores cadastrados no sistema ainda.
              </p>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListaColaboradores;