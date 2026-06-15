// src/pages/EnviarDocumentos.tsx

import { useState, useCallback } from "react";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, FileText, X, User, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

// 💡 NOVO: Importa o hook customizado
import { useDocumentUpload } from "@/hooks/useDocumentUpload";
// 💡 NOVO: Importa utilitários de tipo
import { ALLOWED_ACCEPT_STRING, ALLOWED_MIME_TYPES, MAX_UPLOAD_SIZE_BYTES } from "@/types/document";

const EnviarDocumentos = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  
  // 💡 HOOK: Toda a lógica de dados, estado e upload
  const {
    employees,
    selectedEmployeeId,
    selectedFile,
    isUploading,
    isFetchingEmployees,
    fileInputRef,
    fileError,
    handleFileChange,
    handleSelectEmployee,
    handleUpload,
    handleClearFile,
  } = useDocumentUpload();

  return (
    <PageShell
      sidebarOpen={sidebarOpen}
      toggleSidebar={handleToggleSidebar}
      mainClassName="pt-24 sm:pt-32 mobile-container pb-12 px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 relative z-10 bg-[#F8FAFC] overflow-x-hidden"
    >
      <div className="mx-auto w-full max-w-3xl space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
                  Enviar Documentos
                </h1>
                <p className="text-muted-foreground">Envie documentos para o seu perfil ou para um colaborador.</p>
              </div>
            </div>
          </div>

            <Card className="border-l-4 border-l-primary shadow-card">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border">
                <CardTitle className="text-xl text-foreground">Upload de Arquivo</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Escolha um arquivo e selecione o destinatário.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                {/* 1. SELEÇÃO DO COLABORADOR */}
                <div className="space-y-2">
                  <Label htmlFor="employee-select" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <User className="h-4 w-4" /> Colaborador Destinatário
                  </Label>
                  <Select
                    value={selectedEmployeeId}
                    onValueChange={handleSelectEmployee} // 💡 Handler do hook
                    disabled={isFetchingEmployees || isUploading}
                  >
                    <SelectTrigger className="w-full bg-background border-input">
                      <SelectValue placeholder={isFetchingEmployees ? "Carregando colaboradores..." : "Selecione o colaborador"} />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      {employees.map((employee) => (
                        <SelectItem key={employee.employeeId} value={employee.employeeId}>
                          <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span>{employee.fullName}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isFetchingEmployees && (
                      <div className="flex items-center gap-2 text-primary text-sm">
                          <Loader2 className="h-4 w-4 animate-spin" /> Carregando lista...
                      </div>
                  )}
                </div>

                {/* 2. SELEÇÃO DO ARQUIVO */}
                <div className="space-y-2">
                  <Label htmlFor="file-upload" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Selecionar Arquivo
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    ref={fileInputRef} // 💡 Ref do hook
                    onChange={handleFileChange} // 💡 Handler do hook
                    accept={ALLOWED_ACCEPT_STRING} // 💡 Constante do types
                    className="file:text-primary file:font-medium file:cursor-pointer bg-background border-input"
                    disabled={isUploading}
                  />
                  {fileError && (
                    <p className="text-sm text-destructive flex items-center gap-2 mt-2">
                      <AlertCircle className="h-4 w-4" /> {fileError}
                    </p>
                  )}
                </div>

                {/* 3. PRÉ-VISUALIZAÇÃO DO ARQUIVO */}
                {selectedFile && (
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/50">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground text-sm line-clamp-1">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClearFile} // 💡 Handler do hook
                      className="text-destructive hover:bg-destructive/10"
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                {/* Informações e Dicas */}
                <div className="p-4 bg-muted/30 rounded-lg border border-border/50 text-sm">
                    <p className="text-sm text-primary mb-1">💡 Dica de uso:</p>
                    <p className="text-xs text-muted-foreground">
                      O arquivo **não deve exceder {MAX_UPLOAD_SIZE_BYTES / 1024 / 1024}MB**.<br />
                      Formatos aceitos: {ALLOWED_MIME_TYPES.join(', ')}.
                    </p>
                </div>
                
                {/* 4. Submit Button */}
                <div className="pt-2 sm:pt-4">
                  <Button
                    onClick={handleUpload} // 💡 Handler do hook
                    disabled={!selectedFile || !selectedEmployeeId || isUploading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                    size="lg"
                  >
                    {isUploading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                        </>
                    ) : (
                        "Enviar Documento"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
      </div>
    </PageShell>
  );
};

export default EnviarDocumentos;
