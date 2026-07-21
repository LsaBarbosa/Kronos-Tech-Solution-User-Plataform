import { Eraser, Search, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginationComponent } from "@/components/ui/PaginationComponent";
import type { DocumentItem } from "@/hooks/useDocumentsPage";
import type { DocumentType } from "@/types/document";
import {
  canDeleteDocuments,
  canManageEmployeeSelection,
  findDocumentTypeOption,
  getDocumentRoleCopy,
  type DocumentRole,
} from "../documents-ui.helpers";
import DocumentsHero from "./DocumentsHero";
import DocumentScopeCards from "./DocumentScopeCards";
import DocumentTypeChips from "./DocumentTypeChips";
import DocumentResultsPanel from "./DocumentResultsPanel";

interface DocumentsDesktopViewProps {
  role: DocumentRole;
  employees: Array<{ id: string; name: string }>;
  selectedEmployeeId: string;
  onSelectEmployee: (value: string) => void;
  selectedDocumentType: DocumentType | "";
  onSelectDocumentType: (value: DocumentType) => void;
  activeEmployeeFilter: string;
  onActiveEmployeeFilterChange: (value: string) => void;
  isFetchingEmployees: boolean;
  searchDate: string;
  onSearchDateChange: (value: string) => void;
  documents: DocumentItem[];
  filteredDocuments: DocumentItem[];
  paginatedDocuments: DocumentItem[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isSearching: boolean;
  hasSearched: boolean;
  isPartner: boolean;
  onSearch: () => void;
  onClearFilters: () => void;
  onDownload: (document: DocumentItem) => void;
  onRequestDelete: (document: DocumentItem) => void;
  onBack: () => void;
  formatDate: (value: string) => string;
}

const DocumentsDesktopView = ({
  role,
  employees,
  selectedEmployeeId,
  onSelectEmployee,
  selectedDocumentType,
  onSelectDocumentType,
  activeEmployeeFilter,
  onActiveEmployeeFilterChange,
  isFetchingEmployees,
  searchDate,
  onSearchDateChange,
  documents,
  filteredDocuments,
  paginatedDocuments,
  currentPage,
  totalPages,
  onPageChange,
  isSearching,
  hasSearched,
  isPartner,
  onSearch,
  onClearFilters,
  onDownload,
  onRequestDelete,
  onBack,
  formatDate,
}: DocumentsDesktopViewProps) => {
  const scope = getDocumentRoleCopy(role);
  const allowEmployeeSelection = canManageEmployeeSelection(role);
  const canDelete = canDeleteDocuments(role);
  const selectedType = findDocumentTypeOption(selectedDocumentType);
  const searchDisabled =
    !selectedDocumentType ||
    (allowEmployeeSelection && !selectedEmployeeId) ||
    isSearching ||
    isFetchingEmployees;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 lg:space-y-8">
      <DocumentsHero variant="desktop" scope={scope} />

      <DocumentScopeCards activeRole={role} />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Card className="border-border/70 shadow-sm">
          <div className="border-b border-border/60 bg-[#F8FAFC] px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Console de busca
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[#0F172A]">
              Defina escopo, tipo e data
            </h2>
          </div>

          <CardContent className="space-y-6 px-5 py-5">
            {allowEmployeeSelection ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="document-employee-status" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">
                    Status do colaborador
                  </Label>
                  <Select value={activeEmployeeFilter} onValueChange={onActiveEmployeeFilterChange}>
                    <SelectTrigger id="document-employee-status" className="h-11">
                      <SelectValue placeholder={isFetchingEmployees ? "Carregando..." : "Status"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">
                        <span className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-[#16A34A]" />
                          Ativo
                        </span>
                      </SelectItem>
                      <SelectItem value="false">
                        <span className="flex items-center gap-2">
                          <UserX className="h-4 w-4 text-[#DC2626]" />
                          Inativo
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document-employee" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">
                    Colaborador
                  </Label>
                  <Select value={selectedEmployeeId} onValueChange={onSelectEmployee}>
                    <SelectTrigger id="document-employee" className="h-11">
                      <SelectValue placeholder={isFetchingEmployees ? "Carregando..." : "Selecione um colaborador"} />
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
              </div>
            ) : (
              <div className="rounded-xl border border-[#99F6E4] bg-[#F0FDFA] px-4 py-3 text-sm text-[#115E59]">
                <p className="font-semibold">Acervo próprio</p>
                <p className="mt-0.5 text-xs leading-5 text-[#0F766E]">
                  Seu colaborador está bloqueado pela sessão. Você acessa apenas os documentos vinculados à sua conta.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">
                Tipo documental
              </Label>
              <DocumentTypeChips
                value={selectedDocumentType}
                onChange={onSelectDocumentType}
                variant="desktop"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="document-search-date" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">
                  Data (opcional)
                </Label>
                <Input
                  id="document-search-date"
                  type="date"
                  value={searchDate}
                  onChange={(event) => onSearchDateChange(event.target.value)}
                  className="h-11"
                />
              </div>

              {hasSearched ? (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">
                    Resumo
                  </Label>
                  <div className="rounded-xl border border-border/60 bg-[#F8FAFC] px-3 py-2.5 text-xs text-[#475569]">
                    {filteredDocuments.length} de {documents.length} documento(s) · {selectedType?.label ?? "tipo não selecionado"}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-2 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClearFilters}
                className="h-11 gap-1 border-[#D8E2EC] bg-white text-[#102A43] hover:bg-[#F4F6F9]"
              >
                <Eraser className="h-4 w-4" />
                Limpar filtros
              </Button>
              <Button
                type="button"
                onClick={onSearch}
                disabled={searchDisabled}
                className="h-11 gap-1 bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
              >
                <Search className="h-4 w-4" />
                {isSearching ? "Buscando..." : "Buscar documentos"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <DocumentResultsPanel
          variant="desktop"
          documents={paginatedDocuments}
          totalCount={documents.length}
          filteredCount={filteredDocuments.length}
          selectedType={selectedType}
          hasSearched={hasSearched}
          isSearching={isSearching}
          canDelete={canDelete && !isPartner}
          searchDate={searchDate}
          onDownload={onDownload}
          onRequestDelete={onRequestDelete}
          formatDate={formatDate}
        />
      </div>

      {hasSearched && totalPages > 1 ? (
        <Card className="border-border/70 px-4 py-3 shadow-sm">
          <PaginationComponent
            totalPages={totalPages}
            currentPage={currentPage}
            totalElements={filteredDocuments.length}
            onPageChange={onPageChange}
          />
        </Card>
      ) : null}
    </div>
  );
};

export default DocumentsDesktopView;
