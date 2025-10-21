// src/pages/Documentos.tsx

import { useState, useCallback } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Download, FileText, Calendar, Search, Trash2, FolderOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// 💡 NOVO: Importa o hook customizado
import { useMyDocuments } from "@/hooks/useMyDocuments";
// 💡 NOVO: Importa utilitários de tipo
import { formatDate } from "@/types/document";

const Documentos = () => {
  // 💡 Estado de UI (Sidebar) é o único estado mantido localmente
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const [searchTerm, setSearchTerm] = useState("");

  // 💡 HOOK: Toda a lógica de dados e ações
  const {
    documents,
    isLoading,
    isDeleting,
    error,
    handleDeleteDocument,
    generateDownloadUrl,
  } = useMyDocuments();
  
  // Lógica de filtragem pura, baseada no estado do hook
  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  Meus Documentos
                </h1>
                <p className="text-muted-foreground">Visualize e gerencie os documentos relacionados ao seu perfil.</p>
              </div>
            </div>
          </div>

          <Card className="border-l-4 border-l-primary shadow-card">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Arquivos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6 flex gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Filtrar por nome ou tipo de documento..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="secondary" onClick={() => setSearchTerm("")}>
                  Limpar Filtro
                </Button>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-primary">Carregando documentos...</span>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-destructive">
                  <p>{error}</p>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum documento encontrado.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDocuments.map((document) => (
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
                      
                       <Button
                          variant="ghost"
                          size="icon"
                          // 💡 Chama o handler do hook
                          onClick={() => handleDeleteDocument(document.id, document.name)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          title="Excluir"
                          disabled={isDeleting}
                        >
                          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
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

export default Documentos;