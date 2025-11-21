// src/pages/BuscarEmpresa.tsx

import { useState, useCallback } from "react";
// 💡 REMOVIDOS: useEffect, zodResolver, z, useForm, API_BASE_URL, useToast
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { ArrowLeft, Search, Building2, Mail, MapPin, Hash, Eye, Edit, Power, Loader2, Info, Users, UserX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Separator } from "../components/ui/separator";

// 💡 NOVO: Importa o hook customizado com toda a lógica e estado
import { useCompanySearch } from "@/hooks/useCompanySearch"; 
// 💡 NOVO: Importa a função de limpeza do CEP
import { cleanCEP } from "@/types/company"; 


const BuscarEmpresa = () => {
  // 💡 ESTADO DE UI (Sidebar) é o único estado mantido localmente
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const navigate = useNavigate();
  
  // 💡 HOOK: Desestrutura toda a lógica e estado
  const {
    filteredEmpresas,
    searchTerm,
    editingEmpresa,
    viewingEmpresa,
    isEditDialogOpen,
    isViewDialogOpen,
    loading,
    error,
    isSubmitting,
    editForm,
    setSearchTerm,
    handleEditEmpresa,
    handleViewEmpresa,
    setIsEditDialogOpen,
    setIsViewDialogOpen,
    handleToggleStatus,
    onSubmitEdit,
    formatCNPJ,
    formatCEP,
  } = useCompanySearch();

  // 💡 Funções utilitárias puras (formatCNPJ, formatCEP, cleanCEP) são importadas diretamente do hook/types.
  
  // A função handleEditEmpresa agora requer um casting para CompanyData, 
  // mas como o hook já retorna a CompanyData, podemos simplificar a tipagem na chamada:
  // onClick={() => handleEditEmpresa(empresa as CompanyData)}
  
  return (
    <div className="min-h-screen bg-background relative  overflow-hidden">
      {/* Animated Background and Header/Sidebar components */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background: 'linear-gradient(-45deg, hsl(var(--black-primary)), hsl(var(--primary)), hsl(var(--black-primary)), hsl(var(--primary)))',
            backgroundSize: '400% 400%',
            animation: 'gradient-flow 15s ease-in-out infinite'
          }}
        />
        <div className="absolute inset-0">
          <div
            className="absolute top-1/4 left-1/4 w-32 h-32 opacity-3"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary) / 0.50), transparent)',
              borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
              animation: 'float-shapes 20s ease-in-out infinite'
            }}
          />
          <div
            className="absolute top-3/4 right-1/4 w-48 h-48 opacity-2"
            style={{
              background: 'linear-gradient(45deg, hsl(var(--black-primary) / 0.50), transparent)',
              borderRadius: '70% 30% 30% 70% / 70% 70% 30% 30%',
              animation: 'float-shapes 25s ease-in-out infinite reverse'
            }}
          />
          <div
            className="absolute top-1/2 right-1/3 w-24 h-24 opacity-4"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.50), transparent)',
              borderRadius: '50%',
              animation: 'float-shapes 18s ease-in-out infinite 5s'
            }}
          />
        </div>
      </div>

    <Sidebar isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 💡 CORREÇÃO: Header usa 'toggleSidebar' */}
        <Header toggleSidebar={handleToggleSidebar} />

      <main className="pt-16 mobile-container py-4 sm:py-20 space-y-6 sm:space-y-8 relative z-10">
        <div className="max-w-6xl mx-auto py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate("/empresa")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Buscar Empresas</h1>
              <p className="text-muted-foreground">
                Pesquise e visualize as empresas cadastradas no sistema
              </p>
            </div>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Pesquisar
              </CardTitle>
              <CardDescription>
                Busque por nome, CNPJ ou email da empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="Digite nome, CNPJ ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Empresas Encontradas ({filteredEmpresas.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Carregando empresas...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  <p>{error}</p>
                </div>
              ) : filteredEmpresas.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma empresa encontrada com os critérios de busca.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>CNPJ</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Endereço</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Note: O filtro retorna CompanyListItem. A API deve garantir que os campos necessários
                         para renderização e modais estejam presentes, ou o hook precisa buscar o detalhe.
                         Assumindo que CompanyListItem é suficiente para TUDO, exceto o modal de edição/visualização
                         que é resolvido com o casting para o hook. */}
                      {filteredEmpresas.map((empresa) => (
                        <TableRow key={empresa.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-primary" />
                              {/* 💡 Ação chama o handler do hook, passando a empresa */}
                              <button
                                onClick={() => handleEditEmpresa(empresa as any)}
                                className="hover:text-primary transition-colors"
                              >
                                {empresa.name}
                              </button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Hash className="h-3 w-3 text-muted-foreground" />
                              <code className="text-sm">{formatCNPJ(empresa.cnpj)}</code>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              {empresa.email}
                            </div>
                          </TableCell>
                          <TableCell>
                             {/* 💡 Ação chama o handler do hook */}
                            <button
                              onClick={() => handleToggleStatus(empresa)}
                              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                              disabled={isSubmitting}
                            >
                              <Badge variant={empresa.active ? "default" : "secondary"}>
                                {empresa.active ? "Ativa" : "Inativa"}
                              </Badge>
                              <Power className="h-3 w-3 text-muted-foreground" />
                            </button>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-start gap-2">
                              <MapPin className="h-3 w-3 text-muted-foreground mt-1" />
                              <div className="text-sm">
                                <div>{empresa.address.street}, {empresa.address.number}</div>
                                <div className="text-muted-foreground">
                                  {formatCEP(empresa.address.postalCode)} - {empresa.address.city}/{empresa.address.state}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => handleViewEmpresa(empresa as any)}>
                              <Eye className="h-3 w-3 mr-1" />
                              Ver
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modal de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Editar Empresa
            </DialogTitle>
          </DialogHeader>
          
          <Form {...editForm}>
            {/* 💡 AÇÃO de submit aponta para a função do HOOK */}
            <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Empresa</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o nome da empresa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o email" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="address.postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="12345678" 
                          maxLength={8}
                          {...field} 
                          // 💡 Uso de cleanCEP do types para limpar o input
                          onChange={(e) => field.onChange(cleanCEP(e.target.value))}
                          value={field.value.replace(/[^0-9]/g, '')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="address.number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input placeholder="123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Status</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value === "true")} 
                        value={field.value ? "true" : "false"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">Ativa</SelectItem>
                          <SelectItem value="false">Inativa</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Visualização */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Detalhes da Empresa
            </DialogTitle>
          </DialogHeader>
          {viewingEmpresa && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Building2 className="h-6 w-6 text-primary" />
                  {viewingEmpresa.name}
                </CardTitle>
                <CardDescription>
                  <Badge variant={viewingEmpresa.active ? "default" : "secondary"}>
                    {viewingEmpresa.active ? "Ativa" : "Inativa"}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formatCNPJ(viewingEmpresa.cnpj)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{viewingEmpresa.email}</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <div className="text-sm">
                      {viewingEmpresa.address.street}, {viewingEmpresa.address.number}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {viewingEmpresa.address.neighborhood}, {viewingEmpresa.address.city} - {viewingEmpresa.address.state}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      CEP: {formatCEP(viewingEmpresa.address.postalCode)}
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Funcionários Ativos:</span>
                        <span className="text-sm font-semibold">{viewingEmpresa.activeEmployees}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <UserX className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium">Funcionários Inativos:</span>
                        <span className="text-sm font-semibold">{viewingEmpresa.inactiveEmployees}</span>
                    </div>
                </div>

              </CardContent>
            </Card>
          )}
        </DialogContent>
      </Dialog>

    </div>
    </div>
  );
};

export default BuscarEmpresa;