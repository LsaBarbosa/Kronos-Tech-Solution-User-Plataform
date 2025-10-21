// src/pages/DocumentoColaborador.tsx

import React, { useState, useCallback } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Download, FileText, FolderOpen, User, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// 💡 NOVO: Importa o hook customizado
import { useEmployeeDocuments } from "@/hooks/UseEmployeeDocument";
// 💡 NOVO: Importa utilitários de tipo
import { formatDate } from "@/types/document";

const DocumentoColaborador = () => {
  // 💡 Estado de UI (Sidebar) é o único estado mantido localmente
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  // 💡 HOOK: Toda a lógica de dados e ações
  const {
    employees,
    documents,
    selectedEmployeeId,
    isLoading,
    isFetchingEmployees,
    error,
    setSelectedEmployeeId,
    handleFetchDocuments,
    generateDownloadUrl,
  } = useEmployeeDocuments();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={handleToggleSidebar} />

        <main className="container mx-auto px-4 pt-20 pb-8 overflow-y-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FolderOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
                  Documentos de Colaboradores
                </h1>
                <p className="text-muted-foreground">Acesse documentos de outros membros da equipe.</p>
              </div>
            </div>
          </div>

          <Card className="border-l-4 border-l-primary shadow-card">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border">
              <CardTitle className="text-xl text-foreground">Buscar Documentos</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* 1. Seleção do Colaborador */}
              <div className="space-y-2">
                <Label htmlFor="employee-select" className="text-sm font-medium text-foreground">
                  Colaborador
                </Label>
                <Select
                  value={selectedEmployeeId}
                  onValueChange={setSelectedEmployeeId} // 💡 Setter do hook
                  disabled={isFetchingEmployees}
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
              
              {/* 2. Botão de Busca */}
              <div className="pt-2">
                <Button
                  onClick={() => handleFetchDocuments(selectedEmployeeId)} // 💡 Handler do hook
                  disabled={!selectedEmployeeId || isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                >
                  {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Buscando...
                    </>
                  ) : (
                    <>
                        <Search className="w-4 h-4 mr-2" />
                        Buscar Documentos
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Área de Resultados */}
          <Card className="mt-6 border-l-4 border-l-secondary shadow-card">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-secondary" /> Arquivos Encontrados ({documents.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                  <span className="ml-2 text-secondary">Aguardando busca...</span>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-destructive">
                  <p>{error}</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {selectedEmployeeId ? "Nenhum documento encontrado para este colaborador." : "Selecione um colaborador acima para buscar."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((document) => (
                    <div
                      key={document.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                    >
                      {/* Link de Download */}
                      <a
                        href={generateDownloadUrl(document.id)} // 💡 Usa a função do hook/service
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center space-x-3 pr-4 group cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-primary" />
                        <div>
                          <h4 className="font-medium text-foreground group-hover:text-primary">
                            {document.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(document.createdAt)} | Tipo: {document.type}
                          </p>
                        </div>
                        <Download className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default DocumentoColaborador;