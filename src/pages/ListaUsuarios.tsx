import { useState, useMemo } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Search, X, Edit, Save, XCircle, Trash2, Shield } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Mock data - replace with real data from your backend
const initialUsuarios = [
  {
    id: 1,
    username: "admin.sistema",
    role: "Administrador",
    active: true
  },
  {
    id: 2,
    username: "carlos.manager",
    role: "Gerente",
    active: true
  },
  {
    id: 3,
    username: "ana.operadora",
    role: "Operador",
    active: false
  },
  {
    id: 4,
    username: "roberto.analista",
    role: "Analista",
    active: true
  },
  {
    id: 5,
    username: "mariana.supervisor",
    role: "Supervisor",
    active: true
  }
];

const ListaUsuarios = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [usuarios, setUsuarios] = useState(initialUsuarios);
  const [filters, setFilters] = useState({
    username: "",
    role: ""
  });
  const [activeFilter, setActiveFilter] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<any>({});
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  // Filter users based on search criteria
  const filteredUsuarios = useMemo(() => {
    return usuarios.filter((usuario) => {
      const matchesUsername = filters.username === "" ||
        usuario.username.toLowerCase().includes(filters.username.toLowerCase());

      const matchesRole = filters.role === "" ||
        usuario.role.toLowerCase().includes(filters.role.toLowerCase());

        const matchesActive = !activeFilter || usuario.active === true;

      return matchesUsername && matchesRole && matchesActive;
    });
  }, [filters, activeFilter]);

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      username: "",
      role: ""
    });
    setActiveFilter(false);
  };

  const hasActiveFilters = Object.values(filters).some(filter => filter !== "") || activeFilter;

  const handleToggleUserStatus = async (usuarioId: number, currentStatus: boolean) => {
    setUpdatingStatus(usuarioId);
    
    try {
      // TODO: Replace with actual API call
      // await updateUserStatus(usuarioId, !currentStatus);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update local state
      setUsuarios(prev => prev.map(u =>
        u.id === usuarioId ? { ...u, active: !currentStatus } : u
      ));
    } catch (error) {
      console.error('Erro ao atualizar status do usuário:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleEditUsuario = (usuario: any) => {
    setEditingId(usuario.id);
    setEditedData({
      username: usuario.username,
      role: usuario.role
    });
  };

  const handleSaveUsuario = (usuarioId: number) => {
    // TODO: Implement API call to save changes
    console.log('Salvando usuário ID:', usuarioId, 'Dados:', editedData);
    setEditingId(null);
    setEditedData({});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedData({});
  };

  const handleDeleteUsuario = (usuarioId: number) => {
    setUsuarios(prev => prev.filter(u => u.id !== usuarioId));
  };

  const handleEditedDataChange = (field: string, value: string) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'administrador':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'gerente':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'supervisor':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
        case 'analista':
          return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'operador':
        return 'bg-orange-primary/10 text-orange-primary border-orange-primary/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };
  const handleToggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-orange-primary/5"></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-orange-primary/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-orange-primary/15 rounded-full blur-lg animate-float-delayed"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-orange-primary/8 rounded-full blur-2xl animate-float-slow"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-orange-primary/12 rounded-full blur-xl animate-float"></div>

        {/* Geometric Shapes */}
        <div className="absolute top-1/3 left-5 w-16 h-16 border border-orange-primary/20 rotate-45 animate-spin-slow"></div>
        <div className="absolute bottom-1/4 right-10 w-12 h-12 bg-orange-primary/10 transform rotate-12 animate-pulse"></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.015]">
          <div className="h-full w-full" style={{
            backgroundImage: `
              linear-gradient(rgba(239, 108, 0, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(239, 108, 0, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
      </div>


      {/* 💡 CORREÇÃO: Sidebar usa 'toggleSidebar' */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 💡 CORREÇÃO: Header usa 'toggleSidebar' */}
        <Header toggleSidebar={handleToggleSidebar} />


        {/* Content */}
        <div className="relative z-10 min-h-screen pt-20 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 text-center md:text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-2">
                Lista de Usuários
              </h1>
              <p className="text-muted-foreground text-lg">
                Gerencie e visualize todos os usuários do sistema
              </p>
            </div>

            {/* Search Filters */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="w-5 h-5 text-orange-primary" />
                  Filtros de Busca
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="filter-username">Nome de Usuário</Label>
                    <Input
                      id="filter-username"
                      placeholder="Buscar por nome de usuário..."
                      value={filters.username}
                      onChange={(e) => handleFilterChange("username", e.target.value)}
                      className="focus:border-orange-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="filter-role">Função</Label>
                    <Input
                      id="filter-role"
                      placeholder="Buscar por função..."
                      value={filters.role}
                      onChange={(e) => handleFilterChange("role", e.target.value)}
                      className="focus:border-orange-primary"
                    />
                  </div>
                </div>

                {/* Active Filter */}
                <div className="mb-4 pb-4 border-b">
                  <div className="flex items-center space-x-3">
                    <Label htmlFor="filter-active" className="text-sm font-medium">
                      Mostrar apenas usuários ativos
                    </Label>
                    <Switch
                      id="filter-active"
                      checked={activeFilter}
                      onCheckedChange={setActiveFilter}
                      className="data-[state=checked]:bg-orange-primary"
                    />
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {filteredUsuarios.length} de {usuarios.length} usuários
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="text-orange-primary border-orange-primary hover:bg-orange-primary hover:text-white"
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
                  <User className="w-5 h-5 text-orange-primary" />
                  <span className="text-sm text-muted-foreground">
                    {hasActiveFilters ? "Usuários encontrados:" : "Total de usuários:"}
                  </span>
                  <Badge variant="secondary" className="bg-orange-primary/10 text-orange-primary border-orange-primary/20">
                    {hasActiveFilters ? filteredUsuarios.length : usuarios.length}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredUsuarios.map((usuario) => (
                <Card key={usuario.id} className="hover:shadow-lg transition-all duration-300 group border-l-4 border-l-orange-primary/20 hover:border-l-orange-primary">
                  <CardHeader className="pb-3 relative">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {editingId === usuario.id ? (
                          <div className="space-y-2">
                            <Input
                              value={editedData.username || ''}
                              onChange={(e) => handleEditedDataChange('username', e.target.value)}
                              className="text-xl font-semibold focus:border-orange-primary"
                              placeholder="Nome de usuário"
                            />
                            <Input
                              value={editedData.role || ''}
                              onChange={(e) => handleEditedDataChange('role', e.target.value)}
                              className="focus:border-orange-primary"
                              placeholder="Função"
                            />
                          </div>
                        ) : (
                          <>
                            <CardTitle className="text-xl group-hover:text-orange-primary transition-colors duration-300 flex items-center gap-2">
                              <User className="w-5 h-5" />
                              {usuario.username}
                            </CardTitle>
                            <Badge className={`w-fit mt-2 ${getRoleBadgeColor(usuario.role)}`}>
                              <Shield className="w-3 h-3 mr-1" />
                              {usuario.role}
                            </Badge>
                          </>
                        )}
                      </div>

                      {/* Edit/Save/Cancel/Delete Icons */}
                      {editingId === usuario.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveUsuario(usuario.id)}
                            className="p-2 text-white bg-orange-primary hover:bg-orange-primary/90 rounded-full transition-all duration-200 hover:scale-110"
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
                            onClick={() => handleEditUsuario(usuario)}
                            className="p-2 text-orange-primary hover:text-orange-primary hover:bg-orange-primary/10 rounded-full transition-all duration-200 hover:scale-110 group-hover:shadow-sm"
                            title="Editar usuário"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full transition-all duration-200 hover:scale-110"
                                title="Excluir usuário"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Você tem certeza que deseja excluir o usuário <strong>{usuario.username}</strong>? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUsuario(usuario.id)}
                                  className="bg-red-500 hover:bg-red-600 text-white"
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
                    {!editingId || editingId !== usuario.id ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant={usuario.active ? "secondary" : "outline"}
                            className={usuario.active ?
                              "bg-green-500/10 text-green-600 border-green-500/20" :
                              "bg-red-500/10 text-red-600 border-red-500/20"
                            }>
                            {usuario.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>

                        {/* Toggle Switch for Active Status */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Ativo</span>
                          <div className="relative">
                            <Switch
                              checked={usuario.active}
                              onCheckedChange={() => handleToggleUserStatus(usuario.id, usuario.active)}
                              disabled={updatingStatus === usuario.id}
                              className="data-[state=checked]:bg-[#EF6C00] data-[state=unchecked]:bg-muted-foreground/20"
                            />
                            {updatingStatus === usuario.id && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredUsuarios.length === 0 && usuarios.length > 0 && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum usuário encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  Nenhum usuário corresponde aos critérios de busca aplicados.
                </p>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="text-orange-primary border-orange-primary hover:bg-orange-primary hover:text-white"
                >
                  Limpar Filtros
                </Button>
              </div>
            )}

            {/* Empty State (if no users at all) */}
            {usuarios.length === 0 && (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum usuário cadastrado</h3>
                <p className="text-muted-foreground">
                  Não há usuários cadastrados no sistema ainda.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListaUsuarios;