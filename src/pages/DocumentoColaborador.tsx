import React, { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox"; // <--- NOVO IMPORT
import { Upload, FileText, X, Ban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/config/api";

type DocumentType = "DOCTOR_APPOINTMENT" | "EMPLOYEE_DOCUMENTS";
// Função auxiliar para obter os cabeçalhos de autenticação
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("Token não encontrado.");
    return {};
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// Função para decodificar o token JWT
const decodeToken = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(payload);
  } catch (error) {
    console.error("Falha ao decodificar o token", error);
    return null;
  }
};

// FUNÇÃO PARA COMPRESSÃO DE IMAGEM (com alvo de 3MB)
const compressImage = (file: File, maxSizeMB: number = 3): Promise<File> => {
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


export default function DocumentoColaborador() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documentType, setDocumentType] = useState<DocumentType>("DOCTOR_APPOINTMENT");
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    const decoded = decodeToken(token);
    const userId = decoded?.employeeId;
    setCurrentUserId(userId || "");
  }, []);

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
    if (!selectedFile || !currentUserId) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const headers = getAuthHeaders();
      // Remove o Content-Type para permitir que o navegador defina
      // o boundary para o FormData
      delete headers["Content-Type"];
      
      // 1. Aplica a compressão com target de 3MB
      const compressedFile = await compressImage(selectedFile, 3)
      const MAX_SERVER_SIZE = 5 * 1024 * 1024; // 5MB, limite do backend

      // 2. Checa o limite máximo do servidor
      if (compressedFile.size > MAX_SERVER_SIZE) {
        throw new Error("O arquivo ainda é muito grande (acima de 5MB) mesmo após a compressão. Por favor, utilize um arquivo menor.");
      }
      
      const formData = new FormData();
      formData.append("file", compressedFile); // Usa o arquivo comprimido

      const searchParams = new URLSearchParams({
        employeeId: currentUserId,
        type: documentType, // Usa o tipo de documento selecionado
      });

      const response = await fetch(
        `${API_BASE_URL}documents?${searchParams.toString()}`,
        {
          method: "POST",
          headers: headers,
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erro ao enviar atestado.");
      }

      toast({
        title: "Sucesso",
        description: "Arquivo enviado com sucesso!",
      });

      // Reset form
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("Erro de upload:", error);
      toast({
        title: "Erro",
        description:
          error.message || "Erro ao enviar atestado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // FUNÇÃO CORRIGIDA: Adicionado e.stopPropagation() e o tipo de evento
  const removeFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // <--- CORREÇÃO: Impede o clique de propagar para o div que contém o input file
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

        <main className="flex-1 mobile-container pt-20 pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
                Enviar Documentos
              </h1>
            </div>
            <Card className="border-l-4 border-l-primary shadow-card">
              <Card className="border-primary/20 shadow-lg">
                <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-lg border-b border-primary/10">
                  <CardTitle className="text-lg sm:text-xl text-primary">
                    Envie seus documentos para registro
                  </CardTitle>

                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-6">
                  {/* File Upload Area */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Arquivo do Colaborador
                    </Label>
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
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer touch-target"
                        onChange={handleFileSelect}
                        accept=".pdf, .jpg, .jpeg, .png, .docx, .doc"
                      />

                      {!selectedFile ? (
                        <div className="space-y-3 sm:space-y-4">
                          <Upload className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-primary transition-colors" />
                          <div>
                            <p className="text-base sm:text-lg font-medium text-foreground">
                              Clique para selecionar ou arraste um arquivo
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                              Envie aqui os arquivos de texto ou imagem<br />
                              .pdf, .jpg, .jpeg, .png, .docx, .doc
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 sm:space-y-4">
                          <FileText className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-primary" />
                          <div>
                            <p className="text-sm sm:text-lg font-medium break-all text-foreground">
                              {selectedFile.name}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={removeFile} // Chama a função corrigida
                            className="mt-2 touch-target"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Remover arquivo
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Document Type Selector (Radio Buttons) */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Tipo de Documento
                    </Label>
                    <div className="flex flex-col sm:flex-row gap-4">

                      {/* Opção 1: DOCTOR_APPOINTMENT (Atestado Médico) */}
                      <div
                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors w-full sm:w-1/2 ${documentType === "DOCTOR_APPOINTMENT"
                          ? 'bg-primary/10 border border-primary/30 shadow-sm'
                          : 'border border-transparent hover:bg-primary/5'
                          }`}
                        onClick={() => setDocumentType("DOCTOR_APPOINTMENT")}
                      >
                        <Checkbox
                          id="doctor_appointment"
                          checked={documentType === "DOCTOR_APPOINTMENT"}
                          onCheckedChange={() => setDocumentType("DOCTOR_APPOINTMENT")}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-primary/50"
                        />
                        <Label htmlFor="doctor_appointment" className="text-sm cursor-pointer font-medium select-none">
                          Atestado Médico
                        </Label>
                      </div>

                      {/* Opção 2: EMPLOYEE_DOCUMENTS (Documentos Pessoais) */}
                      <div
                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors w-full sm:w-1/2 ${documentType === "EMPLOYEE_DOCUMENTS"
                          ? 'bg-primary/10 border border-primary/30 shadow-sm'
                          : 'border border-transparent hover:bg-primary/5'
                          }`}
                        onClick={() => setDocumentType("EMPLOYEE_DOCUMENTS")}
                      >
                        <Checkbox
                          id="employee_documents"
                          checked={documentType === "EMPLOYEE_DOCUMENTS"}
                          onCheckedChange={() => setDocumentType("EMPLOYEE_DOCUMENTS")}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-primary/50"
                        />
                        <Label htmlFor="employee_documents" className="text-sm cursor-pointer font-medium select-none">
                          Documentos Pessoais
                        </Label>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm text-primary mb-1">💡 Dica de uso:</p>
                    <p className="text-xs text-gray-text">
                      1. Selecione a classificação do arquivo, para uma melhor organização<br />
                      2. Apenas você e seus Administradores podem ver os seus documentos
                    </p>
                    <p className="text-xs text-gray-text mt-2">
                      ⚠️ Imagens serão automaticamente otimizadas (comprimidas).
                      ⚠️ Arquivo com mais de 5MB não serão aceitos no sistema.
                    </p>
                  </div>
                  {/* Document Type Info */}
                  {/* Submit Button */}
                  <div className="pt-2 sm:pt-4">
                    <Button
                      onClick={handleUpload}
                      disabled={!selectedFile || isUploading}
                      className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 touch-target disabled:opacity-50 disabled:cursor-not-allowed"
                      size="lg"
                    >
                      {isUploading
                        ? "Enviando..."
                        : `Enviar ${documentType === "DOCTOR_APPOINTMENT" ? "Atestado Médico" : "Documento Pessoal"}`}
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