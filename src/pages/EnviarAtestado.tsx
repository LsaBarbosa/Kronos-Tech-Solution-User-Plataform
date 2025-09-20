import React, { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, FileText, X, Ban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/config/api";

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

// Function to decode JWT token
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

export default function EnviarAtestado() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
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
      delete headers['Content-Type'];

      const formData = new FormData();
      formData.append("file", selectedFile);
    

      const searchParams = new URLSearchParams({
        employeeId: currentUserId,
        type: "DOCTOR_APPOINTMENT",
      });

      const response = await fetch(`${API_BASE_URL}documents?${searchParams.toString()}`, {
        method: "POST",
        headers: headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao enviar atestado.");
      }

      toast({
        title: "Sucesso",
        description: "Atestado médico enviado com sucesso!",
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
        description: error.message || "Erro ao enviar atestado. Tente novamente.",
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
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Enviar Atestado Médico</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                Faça o upload do seu atestado médico
              </p>
            </div>

            <Card className="border-primary/20 shadow-lg">
              <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-lg border-b border-primary/10">
                <CardTitle className="text-lg sm:text-xl text-primary">Upload de Atestado Médico</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Envie seu atestado médico para registro
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-6">
                {/* File Upload Area */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Arquivo do Atestado Médico</Label>
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

                {/* Document Type Info */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tipo de Documento</Label>
                  <div className="relative group p-3 bg-muted rounded-lg cursor-not-allowed">
                    <p className="text-foreground font-medium">Atestado Médico</p>
                    <Ban className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2 sm:pt-4">
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 touch-target disabled:opacity-50 disabled:cursor-not-allowed"
                    size="lg"
                  >
                    {isUploading ? "Enviando..." : "Enviar Atestado Médico"}
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