import { FileText, Search, ShieldCheck, UserCheck, UserX } from "lucide-react";
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
import { cn } from "@/lib/utils";
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
import DocumentTypeChips from "./DocumentTypeChips";
import DocumentResultsPanel from "./DocumentResultsPanel";

interface DocumentsMobileViewProps {
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
  onDownload: (document: DocumentItem) => void;
  onRequestDelete: (document: DocumentItem) => void;
  onBack: () => void;
  formatDate: (value: string) => string;
}

const StepHeader = ({
  index,
  title,
  subtitle,
}: {
  index: number;
  title: string;
  subtitle?: string;
}) => (
  <div className="mb-3 flex items-start gap-3">
    <span
      aria-hidden="true"
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1E3A8A] text-xs font-semibold text-white"
    >
      {index}
    </span>
    <div>
      <p className="text-sm font-semibold text-[#0F172A]">{title}</p>
      {subtitle ? <p className="mt-0.5 text-xs text-[#64748B]">{subtitle}</p> : null}
    </div>
  </div>
);

const DocumentsMobileView = ({
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
  onDownload,
  onRequestDelete,
  onBack,
  formatDate,
}: DocumentsMobileViewProps) => {
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
    <div className="mx-auto w-full max-w-3xl space-y-4 pb-36">
      <DocumentsHero variant="mobile" scope={scope} />

      <Card className={cn("border shadow-sm", scope.cardClass)}>
        <CardContent className="space-y-2 px-4 py-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#475569]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Escopo atual
          </div>
          <p className="text-sm font-semibold text-[#0F172A]">{scope.title}</p>
          <p className="text-xs leading-5 text-[#475569]">{scope.scope}</p>
          <p className="text-xs leading-5 text-[#64748B]">{scope.restriction}</p>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardContent className="px-4 py-4">
          <StepHeader index={1} title="Tipo de documento" subtitle="Selecione o tipo desejado." />
          <DocumentTypeChips
            value={selectedDocumentType}
            onChange={onSelectDocumentType}
            variant="mobile"
          />
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardContent className="space-y-3 px-4 py-4">
          <StepHeader index={2} title="Filtros" subtitle="Refine por data e colaborador, quando permitido." />

          <div className="space-y-2">
            <Label htmlFor="document-mobile-date" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">
              Data (opcional)
            </Label>
            <Input
              id="document-mobile-date"
              type="date"
              value={searchDate}
              onChange={(event) => onSearchDateChange(event.target.value)}
              className="h-11"
            />
          </div>

          {allowEmployeeSelection ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="document-mobile-status" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">
                  Status do colaborador
                </Label>
                <Select value={activeEmployeeFilter} onValueChange={onActiveEmployeeFilterChange}>
                  <SelectTrigger id="document-mobile-status" className="h-11">
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
                <Label htmlFor="document-mobile-employee" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">
                  Colaborador
                </Label>
                <Select value={selectedEmployeeId} onValueChange={onSelectEmployee}>
                  <SelectTrigger id="document-mobile-employee" className="h-11">
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
            </>
          ) : (
            <div className="rounded-xl border border-[#99F6E4] bg-[#F0FDFA] px-3 py-2.5 text-[11px] leading-5 text-[#0F766E]">
              Colaborador bloqueado pela sessão. Você acessa apenas o seu acervo.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardContent className="space-y-3 px-4 py-4">
          <StepHeader
            index={3}
            title="Resultados"
            subtitle={
              hasSearched
                ? `${filteredDocuments.length} de ${documents.length} documento(s)`
                : "Os documentos encontrados aparecerão aqui."
            }
          />

          <DocumentResultsPanel
            variant="mobile"
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

          {hasSearched && totalPages > 1 ? (
            <PaginationComponent
              totalPages={totalPages}
              currentPage={currentPage}
              totalElements={filteredDocuments.length}
              onPageChange={onPageChange}
            />
          ) : null}
        </CardContent>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div className="min-w-0 flex-1 text-[11px] leading-4 text-[#475569]">
            <p className="flex items-center gap-1 font-semibold text-[#0F172A]">
              <FileText className="h-3.5 w-3.5 text-[#2563EB]" />
              {selectedType ? selectedType.shortLabel : "Tipo não selecionado"}
            </p>
            <p className="truncate">PDF/arquivo · Seguro · LGPD</p>
          </div>
          <Button
            type="button"
            onClick={onSearch}
            disabled={searchDisabled}
            className="h-11 shrink-0 gap-1 bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
          >
            <Search className="h-4 w-4" />
            {isSearching ? "Buscando..." : "Buscar documentos"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DocumentsMobileView;
