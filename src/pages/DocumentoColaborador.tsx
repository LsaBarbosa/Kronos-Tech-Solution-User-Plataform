// src/pages/EnviarDocumentos.tsx

import React, { useState, useRef, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox"; 
import { Upload, FileText, X, UserCheck, UserX, Info, MessageSquareWarningIcon, LucideFileWarning, FileWarning } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { fetchEmployeesForDocuments, uploadEmployeeDocument } from "@/service/documentPortal.service";

interface Employee {
  id: string;
  name: string;
}

// Constantes para validação
const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_COMPRESS_SIZE_MB = 3; // 3MB target for image compression
const ALLOWED_MIME_TYPES = ['.pdf', '.jpg', '.jpeg', '.png', '.docx', '.doc'];
const ALLOWED_ACCEPT_STRING = ALLOWED_MIME_TYPES.join(', ');


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
  // Estado inicial vazio para ser definido dinamicamente no useEffect
  const [selectedDocumentType, setSelectedDocumentType] = useState(""); 
  const [activeEmployeeFilter, setActiveEmployeeFilter] = useState("true");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetchingEmployees, setIsFetchingEmployees] = useState(false);
  const [isPartner, setIsPartner] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUserName, setCurrentUserName] = useState("");
  // Estado para armazenar a role do usuário
  const [userRole, setUserRole] = useState(""); 
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { session } = useAuth();
  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  useEffect(() => {
    const userRole = session?.role; 
    const userId = session?.employeeId;
    const userName = session?.username;

    const isManager = userRole === 'MANAGER'; 
    
    setIsPartner(userRole === 'PARTNER');
    setCurrentUserId(userId || "");
    setCurrentUserName(userName || "");
    setUserRole(userRole || "");

    // AJUSTE CRÍTICO: Definir selectedEmployeeId automaticamente para NÃO-MANAGERS
    if (!isManager) {
        // Para PARTNER e qualquer outro usuário não-MANAGER, 
        // o ID selecionado é o do próprio usuário logado.
        setEmployees([{ id: userId, name: userName }]); 
        setSelectedEmployeeId(userId || ""); // Define o ID do próprio usuário (RESOLVE O PROBLEMA DO BOTÃO)
    } else {
        // Para MANAGER, o ID deve ser limpo para que ele selecione um.
        setSelectedEmployeeId(""); 
    }
    
    // Lógica de definição do tipo de documento padrão
    if (isManager) {
        setSelectedDocumentType("PAYSLIP"); 
    } else {
        setSelectedDocumentType("TIME_OFF"); 
    }
    
    // Lógica de busca de funcionários (Somente para MANAGER)
    if (isManager) { 
        const fetchEmployees = async () => {
            setIsFetchingEmployees(true);
            try {
                const data = { employees: await fetchEmployeesForDocuments(activeEmployeeFilter) };
                const formattedEmployees: Employee[] = data.employees.map((emp: any) => ({
                    id: emp.employeeId,
                    name: emp.fullName,
                }));
                setEmployees(formattedEmployees);
            } catch (error) {
                console.error("Erro ao buscar funcionários:", error);
                toast({
                    title: "Erro",
                    description: (error as Error).message || "Erro ao buscar a lista de funcionários. Tente novamente.",
                    variant: "destructive",
                });
            } finally {
                setIsFetchingEmployees(false);
            }
        };

        fetchEmployees();
    }
  }, [activeEmployeeFilter, session]);

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
    // A verificação de !selectedEmployeeId agora só impede o MANAGER de avançar sem selecionar.
    if (!selectedFile || !selectedEmployeeId) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um funcionário e um arquivo.",
        variant: "destructive",
      });
      return;
    }

    if (selectedFile.size > MAX_UPLOAD_SIZE_BYTES) {
      toast({
        title: "Arquivo muito grande",
        description: `O arquivo "${selectedFile.name}" excede o limite máximo de 5MB. Por favor, utilize um arquivo menor.`,
        variant: "destructive",
      });
      return; 
    }


    setIsUploading(true);

    try {
      // 1. Aplica a compressão de imagem (se for imagem e for > 3MB)
      const finalFile = await compressImage(selectedFile, MAX_COMPRESS_SIZE_MB);

      await uploadEmployeeDocument(finalFile, selectedEmployeeId, selectedDocumentType);

      toast({
        title: "Sucesso",
        description: "Documento enviado com sucesso!",
      });

      // Reset form
      setSelectedFile(null);
      // Mantém o ID selecionado se for um Manager, limpa para outros
      if (userRole !== 'MANAGER') {
         setSelectedEmployeeId("");
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("Erro de upload:", error);
      toast({
        title: "Erro",
        description: (error as Error).message || "Erro ao enviar documento. Tente novamente.",
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

  // LÓGICA DE VISIBILIDADE DOS CAMPOS
  const isManager = userRole === 'MANAGER';
  // A área de seleção de funcionário só é mostrada para o MANAGER
  const showEmployeeSelectionArea = isManager;


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
            Enviar Documentos
          </h1>
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
                  
                  {/* Employee Status Selection (Somente MANAGER) */}
                  {showEmployeeSelectionArea && ( 
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
                  )}

                  {/* Employee Selection (Somente MANAGER) */}
                  {showEmployeeSelectionArea && ( 
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
                  )}

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
                        
                        {/* Renderização Condicional para PAYSLIP (Somente MANAGER) */}
                        {isManager && (
                            <SelectItem value="PAYSLIP">Contracheque</SelectItem>
                        )}
                      
                        <SelectItem value="TIME_OFF">Abono de Horas</SelectItem>
                        <SelectItem value="EMPLOYEE_DOCUMENTS">Documentos Pessoais</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <span > Busca por Documentos</span>
                  </h4>
                  <ul className="list-disc list-inside text-xs space-y-2 text-muted-foreground ml-2">
                    <li>
                      Se você é um administrador,  Selecione um colaborador para enviar o arquivoe o tipo de Documento.
                    </li>
                    <li>
                      Apenas os Administradores e o colaborador destinatário podem ver os seus documentos.
                    </li>
                    </ul>
                     <br />
                     <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                    <MessageSquareWarningIcon className="w-5 h-5 text-primary"/>  Atenção
                  </h4>
                  <ul className="list-disc list-inside text-xs space-y-2 text-muted-foreground ml-2">
                    <li>
                     Arquivos com mais de 5MB não serão aceitos.
                    </li>
                    
                    </ul>
                  
                </>
              </div>
                
                  {/* Submit Button */}
                  <div className="pt-2 sm:pt-4">
                    <Button
                      // O botão agora só está desabilitado se não houver arquivo OU se for Manager e não tiver selecionado um employeeId
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
          
        </main>
      </div>
    </div>
     
  );
}
