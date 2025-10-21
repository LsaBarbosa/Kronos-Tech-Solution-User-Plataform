import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { MessageSquarePlus, Send, User, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { API_BASE_URL } from "@/config/api";
import { ToastAction } from "@/components/ui/toast";
import { Checkbox } from "@/components/ui/checkbox"; 

// Interface para os dados do colaborador
interface Employee {
  employeeId: string;
  fullName: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error("Token de autenticação não encontrado.");
  }
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
};

const CriarAviso = () => {
  const [title, setTitle] = useState("");
  const [tipo, setTipo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // ESTADOS PARA DESTINATÁRIOS
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isFetchingEmployees, setIsFetchingEmployees] = useState(false);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  
  // NOVO ESTADO: Termo de filtro
  const [filterTerm, setFilterTerm] = useState("");
  
  // Lógica de filtragem dos colaboradores
  const filteredEmployees = employees.filter(employee =>
    employee.fullName.toLowerCase().includes(filterTerm.toLowerCase())
  );
  
  // Lógica para determinar se TODOS os colaboradores VISÍVEIS estão selecionados
  const isAllSelected = filteredEmployees.length > 0 && filteredEmployees.every(employee => selectedEmployeeIds.includes(employee.employeeId));
  
  // Lógica para des/selecionar todos os colaboradores VISÍVEIS
  const handleSelectAll = (checked: boolean) => {
    setSelectedEmployeeIds(prev => {
        const newIds = new Set(prev);
        const filteredIds = filteredEmployees.map(emp => emp.employeeId);

        if (checked) {
            // Adiciona todos os IDs atualmente filtrados
            filteredIds.forEach(id => newIds.add(id));
        } else {
            // Remove todos os IDs atualmente filtrados (mantendo os não filtrados que estavam selecionados)
            filteredIds.forEach(id => newIds.delete(id));
        }
        return Array.from(newIds);
    });
  };

  // Funções de estilo
  const getTipoColor = (tipo: string) => { 
    switch (tipo) {
      case "normal": return "text-muted-foreground";
      case "alert": return "text-yellow-600";
      case "critical": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };
  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "normal": return "Normal";
      case "alert": return "Alerta";
      case "critical": return "Crítico";
      default: return "Selecione o tipo";
    }
  };
  
  // Função para buscar a lista de colaboradores
  const fetchEmployees = useCallback(async () => {
    setIsFetchingEmployees(true);
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}employee?active=true`, { headers });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Falha ao buscar a lista de colaboradores.");
      }
      
      const data = await response.json();
      const formattedEmployees: Employee[] = data.employees.map((emp: any) => ({
        employeeId: emp.employeeId,
        fullName: emp.fullName,
      }));
      setEmployees(formattedEmployees);

    } catch (error: any) {
      console.error("Erro ao buscar colaboradores:", error);
      toast({
        title: "Atenção",
        description: error.message || "Não foi possível carregar a lista de colaboradores para seleção.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingEmployees(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);
  
  // Função para adicionar/remover um colaborador da lista de selecionados
  const handleToggleEmployee = (employeeId: string) => {
    setSelectedEmployeeIds(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };
  
  // FUNÇÃO DE POSTAR
  const handlePostar = async () => {
    // 1. Validação de campos obrigatórios
    if (!tipo || !title.trim() || !mensagem.trim()) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, preencha o Título, o Tipo e a Mensagem do aviso.",
        variant: "destructive",
      });
      return;
    }
    
    // 2. Avisa sobre o envio sem destinatários (apenas para o remetente)
    if (selectedEmployeeIds.length === 0) {
         toast({
            title: "Atenção: Aviso Privado",
            description: "Nenhum colaborador selecionado. O aviso só será visível para você (Remetente).",
            variant: "default",
          });
    }

    setIsPosting(true);

    try {
      const headers = getAuthHeaders();
      
      // 3. Montagem do Payload: Envia a lista selecionada (pode ser vazia)
      const payload = {
        title: title.trim(),
        messageText: mensagem.trim(),
        priority: tipo.toUpperCase(),
        recipientEmployeeIds: selectedEmployeeIds.filter(Boolean),
      };

      const response = await fetch(`${API_BASE_URL}messages`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || "Erro ao postar o aviso.");
      }

      // 4. Sucesso e Limpeza
      setTitle("");
      setTipo("");
      setMensagem("");
      setSelectedEmployeeIds([]);
      setFilterTerm(""); // Limpa o filtro
      
      const recipientCount = selectedEmployeeIds.length;
      let toastDescription = "";
      if (recipientCount === 0) {
          toastDescription = "O aviso foi criado e está visível apenas para você.";
      } else {
          toastDescription = `O aviso foi postado com sucesso para ${recipientCount} destinatário(s).`;
      }


      toast({
        title: "Aviso criado",
        description: toastDescription,
        action: <ToastAction altText="Ir para avisos" onClick={() => navigate("/avisos")}>Ir para Avisos</ToastAction>,
      });

    } catch (error: any) {
      console.error("Erro ao postar aviso:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao postar o aviso.",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  
  const isFormValid = !!tipo && !!title.trim() && !!mensagem.trim();

  const handleToggleSidebar = () => setSidebarOpen((prev) => !prev); 
  return (
    <div className="flex h-screen bg-background">
      {/* 💡 CORREÇÃO: Sidebar usa 'toggleSidebar' */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} /> 
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 💡 CORREÇÃO: Header usa 'toggleSidebar' */}
        <Header toggleSidebar={handleToggleSidebar} />


      <main className="container mx-auto px-4 pt-20 pb-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MessageSquarePlus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
                Criar Aviso</h1>
              <p className="text-muted-foreground">Comunique-se de forma clara e objetiva com a equipe.</p>
            </div>
          </div>
        </div>

        <Card className="border-l-4 border-l-primary shadow-card">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border">
            <CardTitle className="text-xl text-foreground">Novo Aviso</CardTitle>
            <CardDescription className="text-muted-foreground">
             Crie comunicados direcionados a colaboradores específicos.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            {/* Título do Aviso */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-foreground">
                Título do Aviso
              </Label>
              <Input
                id="title"
                placeholder="Ex: Mudança no Horário de Verão"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-background border-input"
              />
              <span className="text-xs text-muted-foreground">
                Recomendado um título curto e direto.
              </span>
            </div>
            
            {/* Tipo do Aviso */}
            <div className="space-y-2">
              <Label htmlFor="tipo" className="text-sm font-medium text-foreground">
                Tipo do Aviso
              </Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger className="w-full bg-background border-input">
                  <SelectValue placeholder="Selecione o tipo do aviso" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="normal" className="hover:bg-accent">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                      <span>Informativo</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="alert" className="hover:bg-accent">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-600"></div>
                      <span>Alerta</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="critical" className="hover:bg-accent">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-destructive"></div>
                      <span>Crítico</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {tipo && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-muted-foreground">Tipo selecionado:</span>
                  <span className={`text-sm font-medium ${getTipoColor(tipo)}`}>
                    {getTipoLabel(tipo)}
                  </span>
                </div>
              )}
            </div>

            {/* SELEÇÃO DE DESTINATÁRIOS */}
            <div className="space-y-4 pt-2 border-t border-border/50">
                <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Destinatários Específicos
                </Label>
                
                {/* NOVO CAMPO DE FILTRO */}
                <Input
                    id="employee-filter"
                    placeholder="Filtrar por nome do colaborador..."
                    value={filterTerm}
                    onChange={(e) => setFilterTerm(e.target.value)}
                    className="bg-background border-input"
                />

                {/* NOVO CHECKBOX MESTRE */}
                <div className="flex items-center space-x-2 pb-2 border-b border-border">
                    <Checkbox
                        id="select-all-employees"
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll} 
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        disabled={filteredEmployees.length === 0}
                    />
                    <Label htmlFor="select-all-employees" className="text-sm font-bold flex-1 cursor-pointer text-primary">
                        Selecionar Todos os Colaboradores Visíveis ({selectedEmployeeIds.length}/{employees.length})
                    </Label>
                </div>
                
                {/* LISTA DE COLABORADORES FILTRADA */}
                <div className="p-3 bg-muted/30 rounded-lg space-y-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {isFetchingEmployees && (
                        <p className="text-sm text-muted-foreground">Carregando lista de colaboradores...</p>
                    )}
                    
                    {filteredEmployees.length === 0 && !isFetchingEmployees && filterTerm && (
                         <p className="text-sm text-muted-foreground">Nenhum colaborador encontrado com o filtro "{filterTerm}".</p>
                    )}

                    {filteredEmployees.map((employee) => (
                        <div key={employee.employeeId} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer">
                            <Checkbox
                                id={`emp-${employee.employeeId}`}
                                checked={selectedEmployeeIds.includes(employee.employeeId)}
                                onCheckedChange={() => handleToggleEmployee(employee.employeeId)}
                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <Label htmlFor={`emp-${employee.employeeId}`} className="text-sm font-medium flex-1 cursor-pointer text-foreground">
                                <div className="flex items-center gap-2">
                                     <User className="w-4 h-4" />
                                     <span>{employee.fullName}</span>
                                     {selectedEmployeeIds.includes(employee.employeeId) && (
                                          <span className="text-xs text-primary/70 ml-auto">Selecionado</span>
                                     )}
                                </div>
                            </Label>
                        </div>
                    ))}
                </div>
                
                 {selectedEmployeeIds.length === 0 && (
                     <p className="text-sm text-muted-foreground font-medium pt-2">Selecione os colaboradores. Se não selecionar ninguém, o aviso só será visível para você.</p>
                 )}
            </div>

            {/* Mensagem do Aviso */}
            <div className="space-y-2 pt-4 border-t border-border/50">
              <Label htmlFor="mensagem" className="text-sm font-medium text-foreground">
                Mensagem do Aviso
              </Label>
              <Textarea
                id="mensagem"
                placeholder="Digite aqui a mensagem detalhada do aviso..."
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                className="min-h-[200px] bg-background border-input resize-none"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {mensagem.length} caracteres
                </span>
                {mensagem.length > 500 && (
                  <span className="text-xs text-destructive">
                    Mensagem muito longa (recomendado até 500 caracteres)
                  </span>
                )}
              </div>
            </div>

            {/* Botão de Postar */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handlePostar}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
                disabled={!isFormValid || isPosting}
              >
                {isPosting ? (
                  <>
                    <span className="animate-spin mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent" />
                    Postando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Postar Aviso
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
    </div>
  );
};

export default CriarAviso;