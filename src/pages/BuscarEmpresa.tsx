import { useState, useEffect } from "react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { API_BASE_URL } from "../config/api";
import { useToast } from "../hooks/use-toast";
import { Separator } from "../components/ui/separator";

// Schema para edição da empresa
const editEmpresaSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  active: z.boolean(),
  address: z.object({
    postalCode: z.string().min(8, "CEP deve ter 8 dígitos").max(8, "CEP deve ter 8 dígitos"),
    number: z.string().min(1, "Número é obrigatório"),
  }),
});

const BuscarEmpresa = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingEmpresa, setEditingEmpresa] = useState<any>(null);
  const [viewingEmpresa, setViewingEmpresa] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [empresas, setEmpresas] = useState([]); // Estado para as empresas da API
  const [loading, setLoading] = useState(true); // Estado de carregamento
  const [error, setError] = useState<string | null>(null); // Estado para erros
  const [isSubmitting, setIsSubmitting] = useState(false); // Novo estado para o envio do formulário
  const navigate = useNavigate();
  const { toast } = useToast();

  const editForm = useForm({
    resolver: zodResolver(editEmpresaSchema),
    defaultValues: {
      name: "",
      email: "",
      active: true,
      address: {
        postalCode: "",
        number: "",
      },
    },
  });

  // Função para buscar as empresas na API
  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token"); // 🔑 Busca o token no localStorage
      if (!token) {
        setError("Token de autenticação não encontrado.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}companies`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // ⚙️ Adiciona o token no header Authorization
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail ||`Erro: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setEmpresas(data.companies); // ✅ Atualiza o estado com os dados da API
    } catch (err: any) {
      console.error("Falha ao buscar empresas:", err);
      setError("Falha ao carregar as empresas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Chama a função de busca quando o componente é montado
  useEffect(() => {
    fetchCompanies();
  }, []);

  const filteredEmpresas = empresas.filter(empresa =>
    empresa.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.cnpj.includes(searchTerm) ||
    empresa.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  };

  const formatCEP = (cep: string) => {
    return cep.replace(/^(\d{5})(\d{3})$/, "$1-$2");
  };

  const handleEditEmpresa = (empresa: any) => {
    setEditingEmpresa(empresa);
    editForm.reset({
      name: empresa.name,
      email: empresa.email,
      active: empresa.active,
      address: {
        postalCode: empresa.address.postalCode,
        number: empresa.address.number,
      },
    });
    setIsEditDialogOpen(true);
  };

  const handleViewEmpresa = (empresa: any) => {
    setViewingEmpresa(empresa);
    setIsViewDialogOpen(true);
  };

  const handleToggleStatus = async (empresa: any) => {
    setIsSubmitting(true);
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Token de autenticação não encontrado.");
        }

        const response = await fetch(`${API_BASE_URL}companies/${empresa.cnpj}/toggle-activate`, {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ active: !empresa.active })
        });

        if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Falha ao alterar o status da empresa.");
        }

        toast({
            title: "Sucesso!",
            description: `Status da empresa ${empresa.name} alterado.`,
        });

        fetchCompanies();
    } catch (error: any) {
        toast({
            title: 'Erro',
            description: error.message,
            variant: 'destructive',
        });
    } finally {
        setIsSubmitting(false);
    }
};

const onSubmitEdit = async (data: any) => {
    if (!editingEmpresa) return;

    setIsSubmitting(true);
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Token de autenticação não encontrado.");
        }

        const { cnpj } = editingEmpresa;
        const body = {
            name: data.name,
            email: data.email,
            active: data.active,
            address: {
                postalCode: data.address.postalCode.replace(/\D/g, ""),
                number: data.address.number
            },
            location: editingEmpresa.location
        };

        const response = await fetch(`${API_BASE_URL}companies/${cnpj}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Falha ao atualizar a empresa.");
        }

        toast({
            title: "Sucesso!",
            description: `A empresa ${data.name} foi atualizada.`,
        });

        setIsEditDialogOpen(false);
        setEditingEmpresa(null);
        fetchCompanies();

    } catch (error: any) {
        console.error("Erro ao atualizar a empresa:", error);
        toast({
            title: "Erro ao atualizar",
            description: error.message,
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
};

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="pt-16 px-4 md:px-6">
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
                      {filteredEmpresas.map((empresa) => (
                        <TableRow key={empresa.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-primary" />
                              <button
                                onClick={() => handleEditEmpresa(empresa)}
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
                            <button
                              onClick={() => handleToggleStatus(empresa)}
                              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
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
                          <Button variant="outline" size="sm" onClick={() => handleViewEmpresa(empresa)}>
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
  );
};

export default BuscarEmpresa;

