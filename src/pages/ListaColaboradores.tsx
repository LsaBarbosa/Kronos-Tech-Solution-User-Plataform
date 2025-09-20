import { useState, useEffect, useMemo } from "react";
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
  Trash2,
  UserCircle,
  Sparkles,
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
import { API_BASE_URL } from "@/config/api";
import { Switch } from "@/components/ui/switch";

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
  jobPosition: string;
  email: string;
  salary: number;
  phone: string;
  address: Address;
  companyId: string;
  active: boolean;
}

interface UserData {
  userId: string;
  username: string;
  role: "PARTNER" | "MANAGER";
  enabled: boolean;
  employeeId: string;
}

interface CombinedColaborator extends Employee, UserData {}

const ListaColaboradores = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [colaboradores, setColaboradores] = useState<CombinedColaborator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token de autenticação não encontrado.");
      }

      const [employeesResponse, usersResponse] = await Promise.all([
        fetch(`${API_BASE_URL}employee`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE_URL}users/search`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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
          if (user) {
            return {
              ...employee,
              ...user,
              enabled: user.enabled, // Ensure 'enabled' is correctly mapped
            };
          }
          return null;
        })
        .filter(Boolean) as CombinedColaborator[];

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

  useEffect(() => {
    fetchColaboradores();
  }, []);

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
        colaborador.fullName.toLowerCase().includes(filters.nome.toLowerCase()) ||
        colaborador.username.toLowerCase().includes(filters.nome.toLowerCase());

      const matchesCargo =
        filters.cargo === "" ||
        colaborador.jobPosition.toLowerCase().includes(filters.cargo.toLowerCase());

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
      maskedCpf: "",
      jobPosition: colaborador.jobPosition,
      email: colaborador.email,
      salary: colaborador.salary,
      phone: colaborador.phone,
      postalCode: colaborador.address.postalCode,
      number: colaborador.address.number,
      username: colaborador.username,
      role: colaborador.role,
      enabled: colaborador.enabled,
    });
  };

  const handleSaveColaborador = async (colaboradorId: string) => {
    const cleanedPhone = editedData.phone.replace(/\D/g, '');
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
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token de autenticação não encontrado.");
      }

      const originalColaborador = colaboradores.find(
        (c) => c.employeeId === colaboradorId
      );
      if (!originalColaborador) {
        throw new Error("Colaborador não encontrado para edição.");
      }

      const bodyDataEmployee: { [key: string]: any } = {};
      const bodyDataUser: { [key: string]: any } = {};

      if (editedData.fullName && editedData.fullName !== originalColaborador.fullName) {
        bodyDataEmployee.fullName = editedData.fullName;
      }
      if (editedData.maskedCpf && editedData.maskedCpf.trim() !== "") {
        bodyDataEmployee.cpf = editedData.maskedCpf.replace(/\D/g, "");
      }
      if (editedData.jobPosition && editedData.jobPosition !== originalColaborador.jobPosition) {
        bodyDataEmployee.jobPosition = editedData.jobPosition;
      }
      if (editedData.email && editedData.email !== originalColaborador.email) {
        bodyDataEmployee.email = editedData.email;
      }
      if (editedData.salary !== undefined && editedData.salary !== originalColaborador.salary) {
        bodyDataEmployee.salary = parseFloat(editedData.salary);
      }
      if (editedData.phone && editedData.phone.replace(/\D/g, "") !== originalColaborador.phone) {
        bodyDataEmployee.phone = editedData.phone.replace(/\D/g, "");
      }

      const hasAddressChange =
        (editedData.postalCode &&
          editedData.postalCode !== originalColaborador.address.postalCode) ||
        (editedData.number && editedData.number !== originalColaborador.address.number);
      if (hasAddressChange) {
        bodyDataEmployee.address = {
          postalCode: editedData.postalCode ? editedData.postalCode.replace(/\D/g, "") : undefined,
          number: editedData.number || undefined,
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
        toast({
          title: "Nenhuma alteração",
          description: "Nenhum dado foi alterado para ser salvo.",
        });
        setEditingId(null);
        setEditedData({});
        setIsLoading(false);
        return;
      }

      const promises = [];

      if (Object.keys(bodyDataEmployee).length > 0) {
        promises.push(
          fetch(`${API_BASE_URL}employee/manager/update-employee/${colaboradorId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(bodyDataEmployee),
          })
        );
      }

      if (Object.keys(bodyDataUser).length > 0) {
        promises.push(
          fetch(`${API_BASE_URL}users/search/${originalColaborador.userId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedData({});
  };

  const handleDeleteColaborador = (colaboradorId: string) => {
    setColaboradores((prev) => prev.filter((c) => c.employeeId !== colaboradorId));
  };
  
  // Nova função para deletar o usuário
  const handleDeleteUser = async (userId: string) => {
      try {
          const token = localStorage.getItem("token");
          if (!token) {
              throw new Error("Token de autenticação não encontrado.");
          }

          const response = await fetch(`${API_BASE_URL}users/${userId}`, {
              method: "DELETE",
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`,
              },
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || "Falha ao deletar o usuário.");
          }

          toast({
              title: "Sucesso",
              description: "Usuário deletado com sucesso.",
          });

          // Recarrega a lista de colaboradores após a exclusão
          await fetchColaboradores();

      } catch (error: any) {
          console.error("Erro ao deletar usuário:", error);
          toast({
              title: "Erro",
              description: error.message || "Não foi possível deletar o usuário.",
              variant: "destructive",
          });
      }
  };

  const handleEditedDataChange = (field: string, value: string | boolean) => {
    setEditedData((prev) => {
        if (field === "phone") {
            const sanitizedValue = (value as string).replace(/\D/g, '').slice(0, 11);
            return { ...prev, [field]: sanitizedValue };
        }
        return { ...prev, [field]: value };
    });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5"></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-primary/15 rounded-full blur-lg animate-float-delayed"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-primary/8 rounded-full blur-2xl animate-float-slow"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-primary/12 rounded-full blur-xl animate-float"></div>

        {/* Geometric Shapes */}
        <div className="absolute top-1/3 left-5 w-16 h-16 border border-primary/20 rotate-45 animate-spin-slow"></div>
        <div className="absolute bottom-1/4 right-10 w-12 h-12 bg-primary/10 transform rotate-12 animate-pulse"></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.015]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `
              linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)
            `,
              backgroundSize: "50px 50px",
            }}
          ></div>
        </div>
      </div>

      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Content */}
      <div className="relative z-10 min-h-screen pt-20 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-2">
              Lista de Colaboradores
            </h1>
            <p className="text-muted-foreground text-lg">
              Gerencie e visualize todos os colaboradores da empresa
            </p>
          </div>

          {/* Search Filters */}
          <Card className="mb-8">
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
          </Card>

          {/* Stats */}
          <div className="mb-8">
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

          {/* Collaborators Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-all duration-300 group border-l-4 border-l-primary/20"
                >
                  <CardHeader className="pb-3">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
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
                            </CardTitle>
                            <Badge className="w-fit bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 mt-2">
                              {colaborador.jobPosition}
                            </Badge>
                          </>
                        )}
                      </div>

                      {/* Edit/Save/Cancel Icons */}
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

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all duration-200 hover:scale-110"
                                title="Excluir colaborador"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Você tem certeza que deseja excluir o funcionário{" "}
                                  <strong>{colaborador.fullName}</strong>? Esta ação não pode ser
                                  desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(colaborador.userId)}
                                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {editingId === colaborador.employeeId ? (
                      <>
                        {/* Username */}
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

                        {/* CPF */}
                        <div className="flex items-center gap-3 text-sm">
                          <IdCard className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground w-16">CPF:</span>
                          <Input
                            value={editedData.maskedCpf || ""}
                            onChange={(e) => handleEditedDataChange("maskedCpf", e.target.value)}
                            className="flex-1 h-8 focus:border-primary"
                            placeholder="CPF"
                          />
                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-3 text-sm">
                          <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground w-16">Email:</span>
                          <Input
                            type="email"
                            value={editedData.email || ""}
                            onChange={(e) => handleEditedDataChange("email", e.target.value)}
                            className="flex-1 h-8 focus:border-primary"
                            placeholder="Email"
                          />
                        </div>

                        {/* Phone */}
                        <div className="flex items-center gap-3 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground w-16">Telefone:</span>
                          <Input
                            value={editedData.phone || ""}
                            onChange={(e) => handleEditedDataChange("phone", e.target.value)}
                            className="flex-1 h-8 focus:border-primary"
                            placeholder="Telefone"
                            maxLength={11}
                          />
                        </div>

                        {/* Salary */}
                        <div className="flex items-center gap-3 text-sm">
                          <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground w-16">Salário:</span>
                          <Input
                            type="number"
                            value={editedData.salary || ""}
                            onChange={(e) => handleEditedDataChange("salary", e.target.value)}
                            className="flex-1 h-8 focus:border-primary"
                            placeholder="Salário"
                          />
                        </div>

                        {/* Address - CEP and Number */}
                        <div className="flex items-start gap-3 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div className="flex-1 space-y-2">
                            <div className="flex gap-2">
                              <Input
                                value={editedData.postalCode || ""}
                                onChange={(e) => handleEditedDataChange("postalCode", e.target.value)}
                                className="flex-1 h-8 focus:border-primary"
                                placeholder="CEP"
                              />
                              <Input
                                value={editedData.number || ""}
                                onChange={(e) => handleEditedDataChange("number", e.target.value)}
                                className="flex-1 h-8 focus:border-primary"
                                placeholder="Número"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {colaborador.address.street} - {colaborador.address.city}/{colaborador.address.state}
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Username */}
                        <div className="flex items-center gap-3 text-sm">
                          <UserCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground">Usuário:</span>
                          <span className="font-medium">{colaborador.username}</span>
                        </div>

                        {/* Role */}
                        <div className="flex items-center gap-3 text-sm">
                          <Sparkles className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground">Perfil:</span>
                          <span className="font-medium">
                            {colaborador.role === 'MANAGER' ? 'Administrador' : colaborador.role === 'PARTNER' ? 'Colaborador' : colaborador.role}
                          </span>
                        </div>

                        {/* CPF */}
                        <div className="flex items-center gap-3 text-sm">
                          <IdCard className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground">CPF:</span>
                          <span className="font-medium">{colaborador.maskedCpf}</span>
                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-3 text-sm">
                          <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium truncate">{colaborador.email}</span>
                        </div>

                        {/* Phone */}
                        <div className="flex items-center gap-3 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground">Telefone:</span>
                          <span className="font-medium">{formatPhone(colaborador.phone)}</span>
                        </div>

                        {/* Salary */}
                        <div className="flex items-center gap-3 text-sm">
                          <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground">Salário:</span>
                          <span className="font-bold text-primary">
                            {formatCurrency(colaborador.salary)}
                          </span>
                        </div>

                        {/* Address */}
                        <div className="flex items-start gap-3 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-muted-foreground">Endereço:</span>
                            <p className="font-medium text-xs mt-1 leading-relaxed">
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

          {/* Empty State */}
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

          {/* Empty State (if no collaborators at all) */}
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
  );
};

export default ListaColaboradores;