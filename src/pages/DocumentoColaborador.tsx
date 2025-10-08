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

      const formData = new FormData();
      formData.append("file", selectedFile);

      const searchParams = new URLSearchParams({
        employeeId: currentUserId,
        type: "DOCTOR_APPOINTMENT",
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

        <main className="flex-1 mobile-container pt-20 pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
                Enviar Documentos
              </h1>
            </div>

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
                {/* Document Type Selector (Radio Buttons) */}
                <div className="space-y-3">
    <Label className="text-sm font-medium">
        Tipo de Documento
    </Label>
    <div className="flex flex-col sm:flex-row gap-4">

        {/* Opção 1: DOCTOR_APPOINTMENT (Atestado Médico) */}
        <Label htmlFor="doctor_appointment" className="flex items-center space-x-2 cursor-pointer transition-colors">
            <input
                type="radio"
                id="doctor_appointment"
                name="documentType"
                value="DOCTOR_APPOINTMENT"
                checked={documentType === "DOCTOR_APPOINTMENT"}
                onChange={() => setDocumentType("DOCTOR_APPOINTMENT")}
                // Classes para garantir a cor e REMOVER o contorno/fundo
                className="h-4 w-4 border-gray-300 transition-colors
                           focus:ring-0 focus:ring-offset-0 focus:outline-none 
                           checked:bg-primary checked:border-primary 
                           appearance-none checked:border-none" 
                style={{ accentColor: 'var(--primary)', outline: 'none' }} // Força a cor primária via CSS inline
            />
            <span className="font-medium">Atestado Médico</span>
        </Label>

        {/* Opção 2: EMPLOYEE_DOCUMENTS (Documentos Pessoais) */}
        <Label htmlFor="employee_documents" className="flex items-center space-x-2 cursor-pointer transition-colors">
            <input
                type="radio"
                id="employee_documents"
                name="documentType"
                value="EMPLOYEE_DOCUMENTS"
                checked={documentType === "EMPLOYEE_DOCUMENTS"}
                onChange={() => setDocumentType("EMPLOYEE_DOCUMENTS")}
                className="h-4 w-4 border-gray-300 transition-colors
                           focus:ring-0 focus:ring-offset-0 focus:outline-none 
                           checked:bg-primary checked:border-primary 
                           appearance-none checked:border-none" 
                style={{ accentColor: 'var(--primary)', outline: 'none' }} // Força a cor primária via CSS inline
            />
            <span className="font-medium">Documentos Pessoais</span>
        </Label>
    </div>
</div>
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm text-primary mb-1">💡 Dica de uso:</p>
                  <p className="text-xs text-gray-text">
                    1. Selecione a classificação do arquivo, para uma melhor organização<br/>
                    2. Apenas você e seus Administradores podem ver os seus documentos
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
                      : "Enviar Documento Médico"}
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