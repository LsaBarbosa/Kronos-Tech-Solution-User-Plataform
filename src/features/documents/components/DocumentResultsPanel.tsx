import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Download,
  FileText,
  Loader2,
  Lock,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import type { DocumentItem } from "@/hooks/useDocumentsPage";
import {
  findDocumentTypeOption,
  type DocumentTypeOption,
} from "../documents-ui.helpers";

interface DocumentResultsPanelProps {
  variant: "desktop" | "mobile";
  documents: DocumentItem[];
  totalCount: number;
  filteredCount: number;
  selectedType: DocumentTypeOption | undefined;
  hasSearched: boolean;
  isSearching: boolean;
  canDelete: boolean;
  searchDate: string;
  onDownload: (document: DocumentItem) => void;
  onRequestDelete: (document: DocumentItem) => void;
  formatDate: (value: string) => string;
}

const ResultsHeader = ({
  totalCount,
  filteredCount,
  selectedType,
}: Pick<DocumentResultsPanelProps, "totalCount" | "filteredCount" | "selectedType">) => (
  <div className="flex flex-col gap-1">
    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
      Resultados
    </p>
    <p className="text-sm text-[#0F172A]">
      {selectedType ? selectedType.label : "Selecione um tipo"}
      <span className="ml-2 text-xs text-[#64748B]">
        {filteredCount} de {totalCount} documento(s)
      </span>
    </p>
  </div>
);

const DocumentRow = ({
  document,
  canDelete,
  onDownload,
  onRequestDelete,
  formatDate,
  variant,
}: {
  document: DocumentItem;
  canDelete: boolean;
  onDownload: (document: DocumentItem) => void;
  onRequestDelete: (document: DocumentItem) => void;
  formatDate: (value: string) => string;
  variant: "desktop" | "mobile";
}) => {
  const option = findDocumentTypeOption(document.type);
  const Icon = option?.icon ?? FileText;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-sm transition hover:border-[#2563EB] hover:shadow-md",
        variant === "mobile" && "px-3 py-3"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white",
          option?.tone ?? "from-[#1E3A8A] to-[#2563EB]"
        )}
      >
        <Icon className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#0F172A]" title={document.name}>
          {document.name}
        </p>
        <p className="mt-0.5 truncate text-xs text-[#64748B]">
          {option?.label ?? "Documento"} · {formatDate(document.createdAt)}
        </p>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label={`Baixar ${document.name}`}
          onClick={() => onDownload(document)}
          className="h-10 gap-1 border-[#BFDBFE] bg-[#EFF6FF] px-3 text-[#1D4ED8] hover:bg-[#DBEAFE]"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Baixar</span>
        </Button>

        {canDelete ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Excluir ${document.name}`}
            onClick={() => onRequestDelete(document)}
            className="h-10 w-10 text-[#DC2626] hover:bg-[#FEE2E2]"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
};

const DocumentResultsPanel = ({
  variant,
  documents,
  totalCount,
  filteredCount,
  selectedType,
  hasSearched,
  isSearching,
  canDelete,
  searchDate,
  onDownload,
  onRequestDelete,
  formatDate,
}: DocumentResultsPanelProps) => {
  return (
    <Card className="border-border/70 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border/60 bg-[#F8FAFC] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <ResultsHeader
          totalCount={totalCount}
          filteredCount={filteredCount}
          selectedType={selectedType}
        />
        <Badge variant="outline" className="border-border/70 text-[11px]">
          {filteredCount} visíveis
        </Badge>
      </div>

      <CardContent className="space-y-3 px-4 py-4 sm:px-5">
        {isSearching ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-[#F8FAFC] px-5 py-10 text-[#475569]">
            <Loader2 className="h-5 w-5 animate-spin text-[#2563EB]" />
            <span className="text-sm">Buscando documentos...</span>
          </div>
        ) : !hasSearched ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-[#F8FAFC] px-5 py-10 text-center">
            <ShieldCheck className="mx-auto h-10 w-10 text-[#94A3B8]" />
            <p className="mt-3 text-sm font-semibold text-[#0F172A]">
              Pronto para buscar com escopo seguro
            </p>
            <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-[#64748B]">
              Selecione tipo documental{selectedType ? "" : " "} e (quando permitido) o colaborador,
              depois acione <span className="font-semibold">Buscar documentos</span>.
            </p>
          </div>
        ) : documents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-[#F8FAFC] px-5 py-10 text-center">
            <AlertTriangle className="mx-auto h-10 w-10 text-[#F59E0B]" />
            <p className="mt-3 text-sm font-semibold text-[#0F172A]">
              {searchDate
                ? "Nenhum documento encontrado para a data selecionada"
                : "Nenhum documento encontrado"}
            </p>
            <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-[#64748B]">
              {searchDate
                ? "Ajuste a data ou limpe o filtro para ampliar os resultados."
                : "Altere o tipo documental ou o colaborador para localizar arquivos."}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {documents.map((document) => (
              <DocumentRow
                key={document.id}
                document={document}
                canDelete={canDelete}
                onDownload={onDownload}
                onRequestDelete={onRequestDelete}
                formatDate={formatDate}
                variant={variant}
              />
            ))}
          </div>
        )}

        <div className="flex items-start gap-2 rounded-xl border border-[#E2E8F0] bg-[#F1F5F9] px-3 py-2.5 text-[11px] leading-5 text-[#475569]">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2563EB]" />
          <span>
            Documentos são dados sensíveis. Download é registrado e a exclusão é destrutiva — confirme antes de prosseguir.
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentResultsPanel;
