// src/pages/Documentos.tsx (Aperfeiçoado)

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Download, FileText, Calendar, Search, UserCheck, UserX, Trash2, Loader2, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { es } from 'date-fns/locale';
import { API_BASE_URL } from "@/config/api";
import { useSessionUser } from "@/hooks/useSessionUser";

interface Employee {
  id: string;
  name: string;
}

interface Document {
  id: string;
  name: string;
  createdAt: string;
  type: string;
}

// Auxiliary function to get authentication headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    toast.error("Você não está autenticado. Redirecionando para o login...");
    return {};
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};


// --- NOVA FUNÇÃO PARA TRATAR ERROS DE API ---
const handleApiError = async (response: Response) => {
  try {
    const errorData = await response.json();
    if (errorData.message) {
      toast.error(errorData.message);
    } else {
      toast.error(`Erro ${response.status}: ${errorData.error || 'Ocorreu um erro.'}`);
    }
  } catch {
    toast.error(`Erro ${response.status}: Ocorreu um erro inesperado.`);
  }
};

const Documentos = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedDocumentType, setSelectedDocumentType] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeEmployeeFilter, setActiveEmployeeFilter] = useState("true");
  const [isFetchingEmployees, setIsFetchingEmployees] = useState(false);
  const [isPartner, setIsPartner] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUserName, setCurrentUserName] = useState("");
  const { sessionUser } = useSessionUser();

  useEffect(() => {
    const userRole = sessionUser?.role;
    const userId = sessionUser?.employeeId;
    const userName = sessionUser?.fullName;

    setIsPartner(userRole === 'PARTNER');
    setCurrentUserId(userId || "");
    setCurrentUserName(userName || "");

    if (userRole === 'PARTNER' && userId) {
      setEmployees([{ id: userId, name: userName || "" }]);
      setSelectedEmployeeId(userId);
      return;
    }

    const fetchEmployees = async () => {
      setIsFetchingEmployees(true);
      try {
        const headers = getAuthHeaders();
        if (Object.keys(headers).length === 0) {
          return;
        }

        const response = await fetch(`${API_BASE_URL}employee?active=${activeEmployeeFilter}`, { headers });
        if (!response.ok) {
          await handleApiError(response);
          return;
        }
        const data = await response.json();
        const formattedEmployees: Employee[] = data.employees.map((emp: any) => ({
          id: emp.employeeId,
          name: emp.fullName,
        }));
        setEmployees(formattedEmployees);
        setSelectedEmployeeId("");
      } catch (error) {
        console.error("Erro ao buscar funcionários:", error);
        toast.error("Erro ao buscar a lista de funcionários. Tente novamente.");
      } finally {
        setIsFetchingEmployees(false);
      }
    };

    fetchEmployees();
  }, [activeEmployeeFilter, sessionUser]);

  const handleSearch = async () => {
    if (!selectedEmployeeId || !selectedDocumentType) {
      toast.error("Por favor, selecione um funcionário e um tipo de documento.");
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const headers = getAuthHeaders();
      if (Object.keys(headers).length === 0) return;

      const searchParams = new URLSearchParams({
        employeeId: selectedEmployeeId,
        type: selectedDocumentType,
      });

      const response = await fetch(`${API_BASE_URL}documents?${searchParams.toString()}`, {
        headers: headers,
      });

      if (!response.ok) {
        await handleApiError(response);
        setDocuments([]);
        setFilteredDocuments([]);
        return;
      }

      const data = await response.json();

      const formattedDocuments = data.documents.map((doc: any) => ({
        id: doc.id,
        name: doc.fileName || "Nome Desconhecido",
        createdAt: doc.createdAt || doc.uploadedAt,
        type: selectedDocumentType,
      }));

      setDocuments(formattedDocuments);
      setFilteredDocuments(formattedDocuments);
      toast.success(`${formattedDocuments.length} documento(s) encontrado(s) - ${getDocumentTypeLabel(selectedDocumentType)}`);

    } catch (error) {
      console.error("Erro ao buscar documentos:", error);
      toast.error("Erro ao buscar documentos. Tente novamente.");
      setDocuments([]);
      setFilteredDocuments([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDeleteDocument = async (documentId: string, documentName: string) => {
    if (!selectedEmployeeId) {
        toast.error("Funcionário não selecionado. Não é possível deletar.");
        return;
    }

    // Confirmação (Opcional, mas altamente recomendado para DELETE)
    if (!window.confirm(`Você tem certeza que deseja excluir o documento "${documentName}"?`)) {
        return;
    }

    try {
        const headers = getAuthHeaders();
        if (Object.keys(headers).length === 0) return;

        // Constrói a URL do DELETE: /documents/{documentId}?employeeId={employeeId}
        const url = `${API_BASE_URL}documents/${documentId}?employeeId=${selectedEmployeeId}`;

        const response = await fetch(url, {
            method: "DELETE",
            headers: headers,
        });

        if (!response.ok) {
            await handleApiError(response);
            return;
        }

        // Se o DELETE foi um sucesso (status 204 No Content ou 200 OK), atualiza o estado local
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        setFilteredDocuments(prev => prev.filter(doc => doc.id !== documentId));

        toast.success(`Documento "${documentName}" excluído com sucesso!`);

    } catch (error) {
   if (error.response?.status === 403) {
      const serverMessage = error.response.data?.detail;
    
    }
  }
};

  // Normalize document date string to 'yyyy-MM-dd'
  const toISODate = (dateStr: string): string => {
    if (!dateStr) return "";
    try {
      const [datePart] = dateStr.split(' T ');
      const parts = datePart.split('-');
      // Handles formats like '12-09-25'
      if (parts.length === 3) {
        const [day, month, twoDigitYear] = parts;
        if (twoDigitYear.length === 2) {
          return `20${twoDigitYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${dd}`;
    } catch {
      return "";
    }
  };

  // Filter documents based on selected date (visual-only)
  const filterDocumentsByDate = (date: string) => {
    if (!date) {
      setFilteredDocuments(documents);
      return;
    }

    const filtered = documents.filter(doc => {
      const docDate = toISODate(doc.createdAt);
      return docDate === date;
    });

    setFilteredDocuments(filtered);
  };

  // Handle date filter change
  const handleDateFilterChange = (date: string) => {
    setSearchDate(date);
    filterDocumentsByDate(date);
  };

  const handleDownload = async (document: Document) => {
    try {
      const headers = getAuthHeaders();
      if (Object.keys(headers).length === 0) return;

      const url = `${API_BASE_URL}documents/${document.id}?employeeId=${selectedEmployeeId}`;

      const response = await fetch(url, { headers });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Não foi possível realizar o download")
      }

      const blob = await response.blob();
      const href = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a'); // Use window.document para ser explícito
      link.href = href;
      link.download = document.name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(href);

      toast.success(`Download de ${document.name} iniciado`);

    } catch (error) {
      console.error("Erro ao iniciar o download:", error);
      toast.error(`Falha ao baixar o documento ${document.name}. Tente novamente.`);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const [datePart] = dateString.split(' T ');
      const [day, month, year] = datePart.split('-');

      const formattedDate = new Date(`20${year}-${month}-${day}`);

      if (isNaN(formattedDate.getTime())) {
        return dateString;
      }

      return formattedDate.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return dateString;
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    return type === "PAYSLIP" ? "Contracheque" : "Atestado";
  };

    const handleToggleSidebar = () => setSidebarOpen((prev) => !prev);


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
              background: 'linear-gradient(135deg, hsl(var(--primary) / 0.1), transparent)',
              borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
              animation: 'float-shapes 20s ease-in-out infinite'
            }}
          />
          <div
            className="absolute top-3/4 right-1/4 w-48 h-48 opacity-2"
            style={{
              background: 'linear-gradient(45deg, hsl(var(--black-primary) / 0.05), transparent)',
              borderRadius: '70% 30% 30% 70% / 70% 70% 30% 30%',
              animation: 'float-shapes 25s ease-in-out infinite reverse'
            }}
          />
          <div
            className="absolute top-1/2 right-1/3 w-24 h-24 opacity-4"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.08), transparent)',
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
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
            Buscar Documentos
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Selecione um funcionário e tipo de documento para visualizar e baixar os arquivos disponíveis.
          </p>
        </div>
        
        {/* CARD PRINCIPAL (Filtros) */}
        <Card className="border-l-4 border-l-primary shadow-card">
               
          <Card className="p-4 sm:p-6 card-hover">
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-lg sm:text-xl font-semibold text-foreground orange-underline">
                Filtros de Busca
              </h3>

             <div className="mobile-form-grid lg:grid-cols-3 gap-4 sm:gap-6">
                
              {/* 1. Status do Funcionário (Somente para MANAGER) */}
                {!isPartner && (
                  <div className="space-y-2">
                    <Label htmlFor="employee-status" className="text-sm font-medium">Status do Funcionário</Label>
                    <Select value={activeEmployeeFilter} onValueChange={setActiveEmployeeFilter}>
                      <SelectTrigger className="touch-target">
                        <SelectValue placeholder={isFetchingEmployees ? "Carregando..." : "Status"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">
                          <div className="flex items-center">
                            <UserCheck className="w-4 h-4 mr-2 text-green-500" />
                            <span>Ativo</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="false">
                          <div className="flex items-center">
                            <UserX className="w-4 h-4 mr-2 text-red-500" />
                            <span>Inativo</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {/* 2. Lista de Funcionários (SOMENTE para MANAGER) */}
                {!isPartner && (
                  <div className="space-y-2">
                    <Label htmlFor="employee" className="text-sm font-medium">Funcionário</Label>
                    <Select
                      value={selectedEmployeeId}
                      onValueChange={setSelectedEmployeeId}
                      // Removido disabled={isPartner} pois o componente não é renderizado
                    >
                      <SelectTrigger className="touch-target">
                        <SelectValue placeholder={"Selecione um funcionário"} />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* 3. Tipo de Documento (Ajustado para col-span-3 se for PARTNER) */}
                <div className={cn("space-y-2", isPartner && "lg:col-span-3")}>
                  <Label htmlFor="document-type" className="text-sm font-medium">Tipo de Documento</Label>
                  <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
                    <SelectTrigger className="touch-target">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAYSLIP">Contracheque</SelectItem>
                      <SelectItem value="TIME_OFF">Abono de Horas</SelectItem>
                      <SelectItem value="EMPLOYEE_DOCUMENTS">Documentos Pessoais</SelectItem>
                      <SelectItem value="POINT_RECORD_RECEIPT">Comprovante de Ponto</SelectItem>
                      <SelectItem value="BIOMETRIC_CONSENT_TERM">Termo Consentimento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* CARD DE INSTRUÇÕES (ESTILIZADO) */}
              <div className="p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-xl border-2 border-primary/20 shadow-inner shadow-primary/5">
                <>
                  <h1 className="text-lg font-bold text-primary mb-2 flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary"/> Instruções
                  </h1>
                  <br />
                  <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/40"></div>
                      <span className="animate-pulse"> Busca por Documentos</span>
                  </h4>
                  <ul className="list-disc list-inside text-xs space-y-2 text-muted-foreground ml-2">
                    <li>
                      Se você é um administrador, selecione o colaborador e tipo de documento.
                    </li>
                    <li>
                      Clique em Buscar Documentos para carregar a lista de arquivos disponíveis.
                    </li>
                  </ul>
                </>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleSearch}
                  disabled={!selectedEmployeeId || !selectedDocumentType || isSearching || isFetchingEmployees}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white touch-target shadow-button"
                  size="lg"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {isSearching ? "Buscando..." : "Buscar Documentos"}
                </Button>
              </div>
            </div>
          </Card>
        </Card>
        {/* FIM CARD PRINCIPAL */}

        {hasSearched && (
          <Card className="p-4 sm:p-6 card-hover border-l-4 border-l-secondary">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground orange-underline">
                  Resultados da Busca
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="result-date-filter" className="text-sm font-medium whitespace-nowrap">Filtrar por Data:</Label>
                    <Input
                      id="result-date-filter"
                      type="date"
                      value={searchDate}
                      onChange={(e) => handleDateFilterChange(e.target.value)}
                      className="touch-target w-auto"
                      placeholder="Filtrar resultados"
                    />
                    {searchDate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDateFilterChange("")}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Limpar
                      </Button>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                    {filteredDocuments.length} de {documents.length} documento(s) - {getDocumentTypeLabel(selectedDocumentType)}
                  </div>
                </div>
              </div>

              {isSearching ? (
                <div className="text-center py-8 sm:py-12 space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Carregando documentos...
                  </p>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="text-center py-8 sm:py-12 space-y-3">
                  <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto" />
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {searchDate ? "Nenhum documento encontrado para a data selecionada" : "Nenhum documento encontrado"}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {searchDate ? "Tente selecionar uma data diferente ou limpar o filtro" : "Tente alterar os filtros ou entre em contato com o RH"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredDocuments.map((document) => (
                    <div
                      key={document.id}
                      // MODIFICADO: Estilo do item da lista (flex, borda e hover)
                      className="flex items-center justify-between p-3 border border-border/50 rounded-lg bg-card/80 transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
                    >
                      {/* Link - ocupa o máximo de espaço possível */}
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDownload(document);
                        }}
                        // MODIFICADO: Ocupa o espaço restante para alinhar
                        className="flex flex-1 items-center space-x-3 group hover:text-primary min-w-0" 
                      >
                        {/* Ícone usa primary/80 por padrão, e primary no hover do grupo */}
                        <FileText className="w-5 h-5 text-primary/80 group-hover:text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0 truncate">
                          {/* Hover do texto para primary */}
                          <h4 className="font-medium text-foreground group-hover:text-primary truncate">
                            {document.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(document.createdAt)}
                          </p>
                        </div>
                        {/* Ícone de Download alinhado à direita e com cor temática */}
                        <Download className="w-4 h-4 text-primary opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-4" />
                      </a>
                       
                       {/* Botão de Excluir */}
                       <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteDocument(document.id, document.name)}
                          // Mantido: Destructive hover e alinhamento
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 flex-shrink-0 ml-2"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}
      </main>
    </div>
        </div>

  );
};

export default Documentos;