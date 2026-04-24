import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText, Info, Loader2, MessageSquareWarningIcon, Upload, UserCheck, UserX, X } from "lucide-react";
import { ALLOWED_MIME_TYPES, ALLOWED_ACCEPT_STRING } from "@/types/document";
import { useCollaboratorDocumentUpload } from "@/hooks/useCollaboratorDocumentUpload";

export default function EnviarDocumentos() {
  const {
    sidebarOpen,
    handleToggleSidebar,
    employees,
    selectedEmployeeId,
    setSelectedEmployeeId,
    activeEmployeeFilter,
    setActiveEmployeeFilter,
    selectedFile,
    isDragOver,
    isUploading,
    isFetchingEmployees,
    isPartner,
    currentUserName,
    userRole,
    fileInputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    handleUpload,
    removeFile,
  } = useCollaboratorDocumentUpload();

  const isManager = userRole === "MANAGER";
  const showEmployeeSelectionArea = isManager;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background: "linear-gradient(-45deg, hsl(var(--black-primary)), hsl(var(--primary)), hsl(var(--black-primary)), hsl(var(--primary)))",
            backgroundSize: "400% 400%",
            animation: "gradient-flow 15s ease-in-out infinite",
          }}
        />
        <div className="absolute inset-0">
          <div
            className="absolute top-1/4 left-1/4 w-32 h-32 opacity-3"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary) / 0.1), transparent)",
              borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
              animation: "float-shapes 20s ease-in-out infinite",
            }}
          />
          <div
            className="absolute top-3/4 right-1/4 w-48 h-48 opacity-2"
            style={{
              background: "linear-gradient(45deg, hsl(var(--black-primary) / 0.05), transparent)",
              borderRadius: "70% 30% 30% 70% / 70% 70% 30% 30%",
              animation: "float-shapes 25s ease-in-out infinite reverse",
            }}
          />
          <div
            className="absolute top-1/2 right-1/3 w-24 h-24 opacity-4"
            style={{
              background: "radial-gradient(circle, hsl(var(--primary) / 0.08), transparent)",
              borderRadius: "50%",
              animation: "float-shapes 18s ease-in-out infinite 5s",
            }}
          />
        </div>
      </div>

      <Sidebar isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={handleToggleSidebar} />

        <main className="pt-16 mobile-container py-4 sm:py-20 space-y-6 sm:space-y-8 relative z-10">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
              Enviar Documentos
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              Faça o upload de documentos para {isPartner ? "o seu perfil" : currentUserName || "um funcionário"}.
            </p>
          </div>

          <div className="max-w-xl mx-auto space-y-6">
            <Card className="border-l-4 border-l-primary shadow-card">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border">
                <CardTitle className="text-xl text-foreground">Upload de Arquivo</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Escolha um arquivo e selecione o destinatário.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {showEmployeeSelectionArea && (
                  <div className="space-y-2">
                    <Label htmlFor="employee-status" className="text-sm font-medium text-foreground flex items-center gap-2">
                      Status do Funcionário
                    </Label>
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

                {showEmployeeSelectionArea && (
                  <div className="space-y-2">
                    <Label htmlFor="employee" className="text-sm font-medium text-foreground">
                      Funcionário
                    </Label>
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

                <div className="space-y-2">
                  <Label htmlFor="file-upload" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Selecionar Arquivo
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept={ALLOWED_ACCEPT_STRING}
                    className="file:text-primary file:font-medium file:cursor-pointer bg-background border-input"
                    disabled={isUploading}
                  />
                  {isDragOver && <p className="text-xs text-muted-foreground">Solte o arquivo para fazer upload.</p>}
                  {selectedFile ? (
                    <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/50">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-foreground text-sm line-clamp-1">{selectedFile.name}</p>
                          <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={removeFile} className="text-destructive hover:bg-destructive/10" disabled={isUploading}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-all duration-300 ${
                        isDragOver ? "border-primary bg-primary/10 shadow-lg scale-105" : "border-primary/25 hover:border-primary/50 hover:bg-primary/5"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="space-y-3 sm:space-y-4">
                        <Upload className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-primary transition-colors" />
                        <div>
                          <p className="text-base sm:text-lg font-medium text-foreground">Clique para selecionar ou arraste um arquivo</p>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            Formatos aceitos: {ALLOWED_MIME_TYPES.map((ext) => ext.toUpperCase()).join(", ")} (Máx: 5MB)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-muted/30 rounded-lg border border-border/50 text-sm">
                  <p className="text-sm text-primary mb-1">Dica de uso:</p>
                  <p className="text-xs text-muted-foreground">
                    O arquivo não deve exceder 5MB.
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-xl border-2 border-primary/20 shadow-inner shadow-primary/5">
                  <h1 className="text-lg font-bold text-primary mb-2 flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" /> Instruções
                  </h1>
                  <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/40" />
                    <span>Busca por Documentos</span>
                  </h4>
                  <ul className="list-disc list-inside text-xs space-y-2 text-muted-foreground ml-2">
                    <li>Se você é um administrador, selecione um colaborador e o tipo de documento.</li>
                    <li>Apenas administradores e o colaborador destinatário podem ver os seus documentos.</li>
                  </ul>
                  <h4 className="text-sm font-bold text-primary my-3 flex items-center gap-2">
                    <MessageSquareWarningIcon className="w-5 h-5 text-primary" /> Atenção
                  </h4>
                  <ul className="list-disc list-inside text-xs space-y-2 text-muted-foreground ml-2">
                    <li>Arquivos com mais de 5MB não serão aceitos.</li>
                  </ul>
                </div>

                <div className="pt-2 sm:pt-4">
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || (!isPartner && !selectedEmployeeId) || isUploading}
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 touch-target disabled:opacity-50 disabled:cursor-not-allowed"
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
        </main>
      </div>
    </div>
  );
}
