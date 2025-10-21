import { useState, useCallback } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Trash2,
  UserCircle,
  Loader2,
  Users,
  Shield,
  XCircle,
  CheckCircle,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

// 💡 NOVO: Importa o hook customizado com a lógica de listagem
import { useEmployeeList } from "@/hooks/useEmployeeList";
// 💡 NOVO: Importa utilitários e tipos
import { formatCPF } from "@/types/employee";


const ListaColaboradores = () => {
  // 💡 ESTADO DE UI (Sidebar) é o único estado mantido localmente
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  
  // 💡 HOOK: Toda a lógica de estado, filtros e actions
  const {
    filteredColaboradores,
    isLoading,
    isSubmitting,
    error,
    searchTerm,
    filterRole,
    filterStatus,
    setSearchTerm,
    setFilterRole,
    setFilterStatus,
    handleToggleStatus,
    handleDelete,
    clearFilters,
    colaboradores, // Colaboradores originais
    formatCPF, // Utilitário de formatação
  } = useEmployeeList();

  // Função utilitária para mapear o Role para exibição
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Badge className="bg-destructive hover:bg-destructive/90">ADMIN</Badge>;
      case 'CTO': return <Badge className="bg-purple-600 hover:bg-purple-700">CTO</Badge>;
      case 'MANAGER': return <Badge className="bg-yellow-600 hover:bg-yellow-700">Gestor</Badge>;
      case 'PARTNER': return <Badge className="bg-blue-600 hover:bg-blue-700">Colaborador</Badge>;
      default: return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={handleToggleSidebar} />

        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6 pt-20">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title mb-6">
              Lista de Colaboradores
            </h1>
            <p className="text-muted-foreground mb-8">
              Visualize e gerencie a lista completa de colaboradores e gestores.
            </p>

            {/* BARRA DE FILTROS E BUSCA */}
            <Card className="mb-6 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" /> Filtros de Busca
                </CardTitle>
                <CardDescription>
                  Filtre por nome, CPF, e-mail, cargo e status.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Buscar por nome, CPF ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Filtro por Cargo */}
                  <div className="space-y-1">
                    <Label>Cargo</Label>
                    <Select value={filterRole} onValueChange={setFilterRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filtrar por cargo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Cargos</SelectItem>
                        <SelectItem value="PARTNER">Colaborador</SelectItem>
                        <SelectItem value="MANAGER">Gestor</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="CTO">CTO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtro por Status */}
                  <div className="space-y-1">
                    <Label>Status</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filtrar por status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Status</SelectItem>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Botão de Limpar Filtros */}
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="w-full h-10 border-primary text-primary hover:bg-primary/10"
                    >
                      <X className="h-4 w-4 mr-2" /> Limpar Filtros
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* LISTA DE CARDS DE COLABORADORES */}
            {error && (
              <div className="text-center py-8 text-destructive">
                <p>{error}</p>
              </div>
            )}
            
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <Skeleton className="h-6 w-3/5" />
                      <Skeleton className="h-6 w-1/5" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Separator className="mt-4" />
                      <Skeleton className="h-8 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!isLoading && filteredColaboradores.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredColaboradores.map((colaborador) => (
                  <Card key={colaborador.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <UserCircle className="h-8 w-8 text-primary" />
                        <div>
                          <CardTitle className="text-lg font-bold">{colaborador.fullName}</CardTitle>
                          <CardDescription className="text-sm">{colaborador.jobTitle} @ {colaborador.company.name}</CardDescription>
                        </div>
                      </div>
                      {getRoleBadge(colaborador.role)}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Separator />
                      
                      <div className="text-sm space-y-1">
                        <p className="flex items-center gap-2">
                          <IdCard className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">CPF:</span> {formatCPF(colaborador.cpf)}
                        </p>
                        <p className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Email:</span> {colaborador.email}
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Telefone:</span> {colaborador.phoneNumber}
                        </p>
                      </div>

                      <Separator />
                      
                      <div className="flex justify-between items-center pt-2">
                        {/* SWITCH DE STATUS */}
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`status-${colaborador.id}`} className="text-sm font-medium">
                            {colaborador.active ? "Ativo" : "Inativo"}
                          </Label>
                          <Switch
                            id={`status-${colaborador.id}`}
                            checked={colaborador.active}
                            // 💡 Ação chama o handler do hook
                            onCheckedChange={() => handleToggleStatus(colaborador)}
                            disabled={isSubmitting}
                          />
                        </div>

                        {/* AÇÃO DE DELETAR */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10" disabled={isSubmitting}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-xl flex items-center gap-2 text-destructive">
                                <XCircle className="h-6 w-6" /> Confirmação de Exclusão
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Você tem certeza que deseja excluir permanentemente o colaborador **{colaborador.fullName}**? Esta ação é irreversível.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-destructive hover:bg-destructive/90"
                                // 💡 Ação chama o handler do hook
                                onClick={() => handleDelete(colaborador.id, colaborador.fullName)}
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    "Confirmar Exclusão"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        {/* BOTÃO DE EDITAR (Placeholder para próxima fase) */}
                        <Button variant="outline" size="sm" className="hover:bg-primary/10 text-primary">
                          <Edit className="h-4 w-4 mr-1" /> Editar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State (Filtro) */}
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

            {/* Empty State (Nenhum Cadastro) */}
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
