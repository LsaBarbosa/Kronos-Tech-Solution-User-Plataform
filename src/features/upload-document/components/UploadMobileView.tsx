import type { ChangeEvent, DragEvent, RefObject } from "react";
import { ChevronLeft, Send, ShieldCheck, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DocumentTypeChips from "@/features/documents/components/DocumentTypeChips";
import { cn } from "@/lib/utils";
import type { DocumentType } from "@/types/document";
import {
  canManageRecipientSelection,
  formatFileSize,
  getUploadRoleCopy,
  type UploadRole,
} from "../upload-ui.helpers";
import UploadHero from "./UploadHero";
import UploadDropzone from "./UploadDropzone";

interface UploadMobileViewProps {
  role: UploadRole;
  currentUserName: string;
  employees: Array<{ id: string; name: string }>;
  selectedEmployeeId: string;
  onSelectEmployee: (value: string) => void;
  selectedDocumentType: DocumentType;
  onSelectDocumentType: (value: DocumentType) => void;
  activeEmployeeFilter: string;
  onActiveEmployeeFilterChange: (value: string) => void;
  isFetchingEmployees: boolean;
  selectedFile: File | null;
  isDragOver: boolean;
  isOptimizing: boolean;
  isUploading: boolean;
  fileError: string | null;
  fileInputRef: RefObject<HTMLInputElement>;
  onDragOver: (event: DragEvent) => void;
  onDragLeave: (event: DragEvent) => void;
  onDrop: (event: DragEvent) => void;
  onFileSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  onSubmit: () => void;
  onBack: () => void;
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

const UploadMobileView = ({
  role,
  currentUserName,
  employees,
  selectedEmployeeId,
  onSelectEmployee,
  selectedDocumentType,
  onSelectDocumentType,
  activeEmployeeFilter,
  onActiveEmployeeFilterChange,
  isFetchingEmployees,
  selectedFile,
  isDragOver,
  isOptimizing,
  isUploading,
  fileError,
  fileInputRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  onRemoveFile,
  onSubmit,
  onBack,
}: UploadMobileViewProps) => {
  const scope = getUploadRoleCopy(role);
  const allowRecipientSelection = canManageRecipientSelection(role);

  const recipientReady = allowRecipientSelection ? Boolean(selectedEmployeeId) : true;
  const submitDisabled =
    !recipientReady ||
    !selectedFile ||
    !selectedDocumentType ||
    isUploading ||
    isOptimizing ||
    Boolean(fileError);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 pb-36">
      <div className="flex">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBack}
          className="h-10 gap-1 border-[#D8E2EC] bg-white text-[#102A43] hover:bg-[#F4F6F9]"
        >
          <ChevronLeft className="h-4 w-4" />
          Início
        </Button>
      </div>

      <UploadHero variant="mobile" scope={scope} recipientName={currentUserName} />

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
        <CardContent className="space-y-3 px-4 py-4">
          <StepHeader
            index={1}
            title="Destinatário"
            subtitle={
              allowRecipientSelection
                ? "Selecione o colaborador da equipe."
                : "Destinatário travado: seu próprio perfil."
            }
          />

          {allowRecipientSelection ? (
            <>
              <div className="space-y-2">
                <Label
                  htmlFor="upload-mobile-status"
                  className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]"
                >
                  Status do colaborador
                </Label>
                <Select value={activeEmployeeFilter} onValueChange={onActiveEmployeeFilterChange}>
                  <SelectTrigger id="upload-mobile-status" className="h-11">
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
                <Label
                  htmlFor="upload-mobile-employee"
                  className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]"
                >
                  Colaborador
                </Label>
                <Select
                  value={selectedEmployeeId}
                  onValueChange={onSelectEmployee}
                  disabled={isFetchingEmployees}
                >
                  <SelectTrigger id="upload-mobile-employee" className="h-11">
                    <SelectValue
                      placeholder={isFetchingEmployees ? "Carregando..." : "Selecione um colaborador"}
                    />
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
              {currentUserName
                ? `Documento será enviado para ${currentUserName}.`
                : "Documento será enviado para o colaborador da sessão."}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardContent className="space-y-3 px-4 py-4">
          <StepHeader index={2} title="Arquivo" subtitle="Tipo, formato e tamanho do envio." />

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">
              Tipo documental
            </Label>
            <DocumentTypeChips
              value={selectedDocumentType}
              onChange={onSelectDocumentType}
              variant="mobile"
              disabled={isUploading}
            />
          </div>

          <UploadDropzone
            variant="mobile"
            selectedFile={selectedFile}
            isDragOver={isDragOver}
            isOptimizing={isOptimizing}
            isUploading={isUploading}
            fileError={fileError}
            fileInputRef={fileInputRef}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onFileSelect={onFileSelect}
            onRemoveFile={onRemoveFile}
          />

          <div className="rounded-xl border border-[#E2E8F0] bg-[#F1F5F9] px-3 py-2 text-[11px] leading-5 text-[#475569]">
            Formatos: PDF · JPG · JPEG · PNG · Máx 5MB. Imagens podem ser otimizadas
            antes do envio.
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardContent className="space-y-2 px-4 py-4">
          <StepHeader
            index={3}
            title="Validação"
            subtitle={
              fileError
                ? "Corrija o erro antes de enviar."
                : selectedFile
                  ? "Tudo certo para envio."
                  : "Aguardando arquivo."
            }
          />

          {selectedFile && !fileError ? (
            <p className="rounded-xl border border-[#BBF7D0] bg-[#DCFCE7] px-3 py-2 text-xs leading-5 text-[#15803D]">
              {selectedFile.name} ({formatFileSize(selectedFile.size)}) pronto para envio.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div className="min-w-0 flex-1 text-[11px] leading-4 text-[#475569]">
            <p className="font-semibold text-[#0F172A]">
              {selectedFile ? selectedFile.name : "Nenhum arquivo selecionado"}
            </p>
            <p className="truncate">
              {selectedFile ? formatFileSize(selectedFile.size) : "PDF · JPG · PNG"} ·
              {allowRecipientSelection
                ? selectedEmployeeId
                  ? ` ${employees.find((e) => e.id === selectedEmployeeId)?.name ?? ""}`
                  : " sem destinatário"
                : ` ${currentUserName || "próprio perfil"}`}
            </p>
          </div>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={submitDisabled}
            className="h-11 shrink-0 gap-1 bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
          >
            <Send className="h-4 w-4" />
            {isUploading ? "Enviando..." : "Enviar"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UploadMobileView;
