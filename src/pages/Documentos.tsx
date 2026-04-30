import { useEffect, useMemo, useState } from "react";
import { Download, FileText, Search, UserCheck, UserX, Trash2, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useDocumentsPage } from "@/hooks/useDocumentsPage";
import PageShell from "@/components/PageShell";
import { PaginationComponent } from "@/components/ui/PaginationComponent";
import type { DocumentType } from "@/types/document";
import { EmptyState, LoadingState } from "@/components/states";

const Documentos = () => {
  const {
    sidebarOpen,
    handleToggleSidebar,
    employees,
    selectedEmployeeId,
    setSelectedEmployeeId,
    selectedDocumentType,
    setSelectedDocumentType,
    searchDate,
    filteredDocuments,
    documents,
    isSearching,
    hasSearched,
    activeEmployeeFilter,
    setActiveEmployeeFilter,
    isFetchingEmployees,
    isPartner,
    handleSearch,
    handleDeleteDocument,
    handleDownload,
    handleDateFilterChange,
    formatDate,
    getDocumentTypeLabel,
  } = useDocumentsPage();
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(0);
  }, [selectedEmployeeId, selectedDocumentType, searchDate, hasSearched]);

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const paginatedDocuments = useMemo(
    () => filteredDocuments.slice(currentPage * itemsPerPage, currentPage * itemsPerPage + itemsPerPage),
    [currentPage, filteredDocuments]
  );

  return (
    <PageShell
      sidebarOpen={sidebarOpen}
      toggleSidebar={handleToggleSidebar}
    >
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
              Buscar Documentos
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Selecione um funcionário e tipo de documento para visualizar e baixar os arquivos disponíveis.
            </p>
          </div>

          <Card className="border-l-4 border-l-primary shadow-card">
            <CardContent className="p-4 sm:p-6 card-hover">
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground orange-underline">
                  Filtros de Busca
                </h3>

                <div className="mobile-form-grid lg:grid-cols-3 gap-4 sm:gap-6">
                  {!isPartner && (
                    <div className="space-y-2">
                      <Label htmlFor="employee-status" className="text-sm font-medium">
                        Status do Funcionário
                      </Label>
                      <Select value={activeEmployeeFilter} onValueChange={setActiveEmployeeFilter}>
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

                  {!isPartner && (
                    <div className="space-y-2">
                      <Label htmlFor="employee" className="text-sm font-medium">
                        Funcionário
                      </Label>
                      <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                        <SelectTrigger className="touch-target">
                          <SelectValue placeholder="Selecione um funcionário" />
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

                  <div className={cn("space-y-2", isPartner && "lg:col-span-3")}>
                    <Label htmlFor="document-type" className="text-sm font-medium">
                      Tipo de Documento
                    </Label>
                    <Select
                      value={selectedDocumentType}
                      onValueChange={(value) => setSelectedDocumentType(value as DocumentType | "")}
                    >
                      <SelectTrigger className="touch-target">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PAYSLIP">Contracheque</SelectItem>
                        <SelectItem value="TIME_OFF">Abono de Horas</SelectItem>
                        <SelectItem value="DOCUMENTS">Documentos</SelectItem>
                        <SelectItem value="EMPLOYEE_DOCUMENTS">Documentos Pessoais</SelectItem>
                        <SelectItem value="POINT_RECORD_RECEIPT">Comprovante de Ponto</SelectItem>
                        <SelectItem value="BIOMETRIC_CONSENT_TERM">Termo de Consentimento Biométrico</SelectItem>
                        <SelectItem value="SERVICE_CONTRACT_TERMS">Termo de Contrato de Serviço</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-xl border-2 border-primary/20 shadow-inner shadow-primary/5">
                  <h1 className="text-lg font-bold text-primary mb-2 flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" /> Instruções
                  </h1>
                  <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/40"></div>
                    <span className="animate-pulse"> Busca por Documentos</span>
                  </h4>
                  <ul className="list-disc list-inside text-xs space-y-2 text-muted-foreground ml-2">
                    <li>Se você é um administrador, selecione o colaborador e tipo de documento.</li>
                    <li>Clique em Buscar Documentos para carregar a lista de arquivos disponíveis.</li>
                  </ul>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handleSearch}
                    disabled={!selectedEmployeeId || !selectedDocumentType || isSearching || isFetchingEmployees}
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white touch-target shadow-button"
                    size="lg"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {isSearching ? "Buscando..." : "Buscar Documentos"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {hasSearched && (
            <Card className="p-4 sm:p-6 card-hover border-l-4 border-l-secondary">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground orange-underline">
                    Resultados da Busca
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="result-date-filter" className="text-sm font-medium whitespace-nowrap">
                        Filtrar por Data:
                      </Label>
                      <Input
                        id="result-date-filter"
                        type="date"
                        value={searchDate}
                        onChange={(e) => handleDateFilterChange(e.target.value)}
                        className="touch-target w-auto"
                        placeholder="Filtrar resultados"
                      />
                      {searchDate && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDateFilterChange("")}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          Limpar
                        </Button>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                      {filteredDocuments.length} de {documents.length} documento(s) - {selectedDocumentType ? getDocumentTypeLabel(selectedDocumentType) : "Tipo não selecionado"}
                    </div>
                  </div>
                </div>

                {isSearching ? (
                  <LoadingState
                    title="Carregando documentos..."
                    description="A consulta está em andamento."
                    className="py-8 sm:py-12"
                  />
                ) : filteredDocuments.length === 0 ? (
                  <EmptyState
                    icon={<FileText className="w-10 h-10 sm:w-12 sm:h-12" />}
                    title={searchDate ? "Nenhum documento encontrado para a data selecionada" : "Nenhum documento encontrado"}
                    description={
                      searchDate
                        ? "Tente selecionar uma data diferente ou limpar o filtro."
                        : "Tente alterar os filtros ou entre em contato com o RH."
                    }
                    className="py-8 sm:py-12"
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {paginatedDocuments.map((document) => (
                      <div
                        key={document.id}
                        className="flex items-center justify-between p-3 border border-border/50 rounded-lg bg-card/80 transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
                      >
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            void handleDownload(document);
                          }}
                          className="flex flex-1 items-center space-x-3 group hover:text-primary min-w-0"
                        >
                          <FileText className="w-5 h-5 text-primary/80 group-hover:text-primary flex-shrink-0" />
                          <div className="flex-1 min-w-0 truncate">
                            <h4 className="font-medium text-foreground group-hover:text-primary truncate">
                              {document.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">{formatDate(document.createdAt)}</p>
                          </div>
                          <Download className="w-4 h-4 text-primary opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-4" />
                        </a>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteDocument(document.id, document.name)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 flex-shrink-0 ml-2"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <PaginationComponent
                        totalPages={totalPages}
                        currentPage={currentPage}
                        totalElements={filteredDocuments.length}
                        onPageChange={setCurrentPage}
                      />
                    )}
                  </div>
                )}
              </div>
            </Card>
          )}
    </PageShell>
  );
};

export default Documentos;
