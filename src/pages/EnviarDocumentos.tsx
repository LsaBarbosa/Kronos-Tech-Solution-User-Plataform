import React, { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, FileText, X, UserCheck, UserX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/config/api";

interface Employee {
  id: string;
  name: string;
}

// Auxiliary function to get authentication headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error("Token não encontrado.");
    return {};
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Nova função para decodificar o token JWT
const decodeToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(payload);
  } catch (error) {
    console.error("Falha ao decodificar o token", error);
    return null;
  }
};

export default function EnviarDocumentos() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedDocumentType, setSelectedDocumentType] = useState("PAYSLIP"); // Valor padrão
  const [activeEmployeeFilter, setActiveEmployeeFilter] = useState("true");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetchingEmployees, setIsFetchingEmployees] = useState(false);
  const [isPartner, setIsPartner] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUserName, setCurrentUserName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    const decoded = decodeToken(token);
    const userRole = decoded?.role;
    const userId = decoded?.employeeId;
    const userName = decoded?.fullName;

    setIsPartner(userRole === 'PARTNER');
    setCurrentUserId(userId || "");
    setCurrentUserName(userName || "");

    if (userRole === 'PARTNER') {
      setEmployees([{ id: userId, name: userName }]);
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
          throw new Error("Erro ao buscar funcionários.");
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
        toast({
          title: "Erro",
          description: "Erro ao buscar a lista de funcionários. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsFetchingEmployees(false);
      }
    };
    
    fetchEmployees();
  }, [activeEmployeeFilter]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedEmployeeId) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um funcionário e um arquivo.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);

    try {
      const headers = getAuthHeaders();
      // Remove o Content-Type para permitir que o navegador defina
      // o boundary para o FormData
      delete headers['Content-Type'];

      const formData = new FormData();
      formData.append("file", selectedFile);
    

      const searchParams = new URLSearchParams({
        employeeId: selectedEmployeeId,
        type: selectedDocumentType,
      });

      const response = await fetch(`${API_BASE_URL}documents?${searchParams.toString()}`, {
        method: "POST",
        headers: headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao enviar documento.");
      }

      toast({
        title: "Sucesso",
        description: "Documento enviado com sucesso!",
      });

      // Reset form
      setSelectedFile(null);
      setSelectedEmployeeId("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("Erro de upload:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar documento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex flex-col sm:flex-row min-h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 mobile-container py-4 sm:py-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Enviar Documentos</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                Faça o upload de documentos de folha de pagamento para funcionários
              </p>
            </div>

            <Card className="border-primary/20 shadow-lg">
              <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-lg border-b border-primary/10">
                <CardTitle className="text-lg sm:text-xl text-primary">Upload de Documento</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Selecione o funcionário e envie o arquivo da folha de pagamento
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-6">
                {/* Employee Status Selection */}
                <div className="space-y-2">
                    <Label htmlFor="employee-status" className="text-sm font-medium">Status do Funcionário</Label>
                    <Select value={activeEmployeeFilter} onValueChange={setActiveEmployeeFilter} disabled={isPartner}>
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

                {/* Employee Selection */}
                <div className="space-y-2">
                  <Label htmlFor="employee" className="text-sm font-medium">Funcionário</Label>
                  <Select
                    value={selectedEmployeeId}
                    onValueChange={setSelectedEmployeeId}
                    disabled={isPartner || isFetchingEmployees}
                  >
                    <SelectTrigger className="touch-target">
                      <SelectValue placeholder={isPartner ? currentUserName : "Selecione um funcionário"} />
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

                {/* File Upload Area */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Arquivo da Folha de Pagamento</Label>
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-all duration-300 ${
                      isDragOver
                        ? "border-primary bg-primary/10 shadow-lg scale-105"
                        : "border-primary/25 hover:border-primary/50 hover:bg-primary/5"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer touch-target"
                      onChange={handleFileSelect}
                      accept=".pdf"
                    />
                    
                    {!selectedFile ? (
                      <div className="space-y-3 sm:space-y-4">
                        <Upload className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-primary transition-colors" />
                        <div>
                          <p className="text-base sm:text-lg font-medium text-foreground">Clique para selecionar ou arraste um arquivo</p>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                           Somente arquivos no formato .PDF
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        <FileText className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-primary" />
                        <div>
                          <p className="text-sm sm:text-lg font-medium break-all text-foreground">{selectedFile.name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={removeFile}
                          className="mt-2 touch-target"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remover arquivo
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Document Type Selection */}
                <div className="space-y-2">
                  <Label htmlFor="document-type" className="text-sm font-medium">Tipo de Documento</Label>
                  <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
                    <SelectTrigger className="touch-target">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAYSLIP">Contracheque</SelectItem>
                      <SelectItem value="DOCTOR_APPOINTMENT">Atestado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Submit Button */}
                <div className="pt-2 sm:pt-4">
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || !selectedEmployeeId || isUploading}
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 touch-target disabled:opacity-50 disabled:cursor-not-allowed"
                    size="lg"
                  >
                    {isUploading ? "Enviando..." : "Enviar Documento"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}