import React, { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox"; // Adicionado para manter a coerência de componentes
import { Upload, FileText, X, UserCheck, UserX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/config/api";

interface Employee {
  id: string;
  name: string;
}

// Constantes para validação
const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_COMPRESS_SIZE_MB = 3; // 3MB target for image compression
const ALLOWED_MIME_TYPES = ['.pdf', '.jpg', '.jpeg', '.png', '.docx', '.doc'];
const ALLOWED_ACCEPT_STRING = ALLOWED_MIME_TYPES.join(', ');


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
    const payload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(payload);
  } catch (error) {
    console.error("Falha ao decodificar o token", error);
    return null;
  }
};

// NOVO: Função para compressão de imagem (Target 3MB)
const compressImage = (file: File, maxSizeMB: number = MAX_COMPRESS_SIZE_MB): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Se não for imagem, ou se já for menor que o limite (3MB), retorna o original.
    if (!file.type.startsWith('image/') || file.size <= maxSizeMB * 1024 * 1024) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx!.drawImage(img, 0, 0, img.width, img.height);

        let quality = 0.9;

        // Função auxiliar recursiva para tentar a compressão até atingir o alvo ou qualidade mínima
        const recursiveCompress = (currentQuality: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                return resolve(file);
              }

              const compressedFile = new File([blob], file.name, { type: blob.type, lastModified: Date.now() });

              if (compressedFile.size <= maxSizeMB * 1024 * 1024 || currentQuality <= 0.3) {
                resolve(compressedFile);
              } else if (currentQuality > 0.3) {
                // Tenta reduzir a qualidade
                recursiveCompress(currentQuality - 0.1);
              } else {
                resolve(compressedFile);
              }
            },
            'image/jpeg',
            currentQuality
          );
        };

        recursiveCompress(quality);
      };
      img.onerror = () => reject(new Error("Falha ao carregar a imagem."));
      img.src = event.target!.result as string;
    };
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo."));
    reader.readAsDataURL(file);
  });
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
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erro ao buscar funcionários.");
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
      const file = files[0];

      // Validação de tipo de arquivo
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const isAllowed = ALLOWED_MIME_TYPES.some(ext => file.type.includes(ext.substring(1)) || fileExtension === ext.substring(1));

      if (!isAllowed) {
        toast({
          title: "Formato de arquivo inválido",
          description: `O arquivo "${file.name}" não é suportado. Tipos aceitos: ${ALLOWED_MIME_TYPES.join(', ')}.`,
          variant: "destructive",
        });
        // Limpa o input para permitir uma nova seleção
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      // Validação de tamanho (5MB)
      if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        toast({
          title: "Arquivo muito grande",
          description: `O arquivo "${file.name}" excede o limite máximo de 5MB.`,
          variant: "destructive",
        });
        // Limpa o input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      setSelectedFile(file);
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

    // Validação de 5MB está no handleFileSelect, mas repetimos aqui para segurança caso selectedFile seja setado de outra forma
    if (selectedFile.size > MAX_UPLOAD_SIZE_BYTES) {
      toast({
        title: "Arquivo muito grande",
        description: `O arquivo "${selectedFile.name}" excede o limite máximo de 5MB. Por favor, utilize um arquivo menor.`,
        variant: "destructive",
      });
      return; // Interrompe o processo aqui, se for maior que 5MB.
    }


    setIsUploading(true);

    try {
      const headers = getAuthHeaders();
      delete headers['Content-Type'];

      // 1. Aplica a compressão de imagem (se for imagem e for > 3MB)
      const finalFile = await compressImage(selectedFile, MAX_COMPRESS_SIZE_MB);

      const formData = new FormData();
      formData.append("file", finalFile); // Usa o arquivo comprimido (ou original)

      const searchParams = new URLSearchParams({
        employeeId: selectedEmployeeId,
        type: selectedDocumentType,
      });

      const response = await fetch(`${API_BASE_URL}documents?${searchParams.toString()}`, {
        method: "POST",
        headers: headers,
        body: formData,
      });

      if (!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erro ao enviar documento.");
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

  // FUNÇÃO CORRIGIDA: Adicionamos o stopPropagation e a tipagem do evento
  const removeFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Impede o clique de abrir o input novamente
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

        <main className="flex-1 mobile-container py-4 pt-20 pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
                Enviar Documentos</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                Faça o upload de documentos para um funcionário
              </p>
            </div>
            <Card className="border-l-4 border-l-primary shadow-card">
              <Card className="border-primary/20 shadow-lg">
                <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-lg border-b border-primary/10">
                  <CardTitle className="text-lg sm:text-xl text-primary">Upload de Documento</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Selecione o funcionário e envie o arquivo.
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
                    <Label className="text-sm font-medium">Arquivo</Label>
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-all duration-300 ${isDragOver
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
                        // Usa a lógica para esconder o input quando o arquivo é selecionado
                        className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer touch-target ${selectedFile ? 'hidden' : ''}`}
                        onChange={handleFileSelect}
                        accept={ALLOWED_ACCEPT_STRING} // Tipos de arquivo permitidos
                      />

                      {!selectedFile ? (
                        <div className="space-y-3 sm:space-y-4">
                          <Upload className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-primary transition-colors" />
                          <div>
                            <p className="text-base sm:text-lg font-medium text-foreground">Clique para selecionar ou arraste um arquivo</p>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                              Formatos aceitos: {ALLOWED_MIME_TYPES.map(ext => ext.toUpperCase()).join(', ')} (Máx: 5MB)
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
                        <SelectItem value="EMPLOYEE_DOCUMENTS">Documentos Pessoais</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm text-primary mb-1">💡 Dica de uso:</p>
                    <p className="text-xs text-gray-text">
                      1. Selecione um colaborador para enviar o arquivo<br />
                      2. Apenas os Administradores e o colaborador selecionado podem ver os seus documentos.<br />
                    </p>
                    <p className="text-xs text-gray-text mt-2">
                      ⚠️ Imagens serão automaticamente otimizadas (comprimidas).<br />
                      ⚠️ Arquivo com mais de 5MB não serão aceitos no sistema.
                    </p>
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
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}