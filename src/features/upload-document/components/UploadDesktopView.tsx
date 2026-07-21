import type { ChangeEvent, DragEvent, RefObject } from "react";
import { Check, Eraser, Send, ShieldCheck, UserCheck, UserX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import type { DocumentType } from "@/types/document";
import {
  canManageRecipientSelection,
  formatFileSize,
  getUploadRoleCopy,
  type UploadRole,
} from "../upload-ui.helpers";
import UploadHero from "./UploadHero";
import UploadScopeCard from "./UploadScopeCard";
import UploadDropzone from "./UploadDropzone";

interface UploadDesktopViewProps {
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
  lastUploadAt: Date | null;
  fileInputRef: RefObject<HTMLInputElement>;
  onDragOver: (event: DragEvent) => void;
  onDragLeave: (event: DragEvent) => void;
  onDrop: (event: DragEvent) => void;
  onFileSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  onSubmit: () => void;
  onBack: () => void;
}

const Step = ({
  index,
  title,
  status,
}: {
  index: number;
  title: string;
  status: "done" | "active" | "pending";
}) => (
  <div className="flex items-center gap-3">
    <span
      aria-hidden="true"
      className={
        status === "done"
          ? "flex h-8 w-8 items-center justify-center rounded-full bg-[#16A34A] text-white"
          : status === "active"
            ? "flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB] text-white"
            : "flex h-8 w-8 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-xs font-semibold text-[#64748B]"
      }
    >
      {status === "done" ? <Check className="h-4 w-4" /> : index}
    </span>
    <div className="space-y-0.5">
      <p
        className={
          status === "pending"
            ? "text-sm font-semibold text-[#64748B]"
            : "text-sm font-semibold text-[#0F172A]"
        }
      >
        {title}
      </p>
    </div>
  </div>
);

const UploadDesktopView = ({
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
  lastUploadAt,
  fileInputRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  onRemoveFile,
  onSubmit,
  onBack,
}: UploadDesktopViewProps) => {
  const scope = getUploadRoleCopy(role);
  const allowRecipientSelection = canManageRecipientSelection(role);
  const recipientName =
    allowRecipientSelection && selectedEmployeeId
      ? employees.find((emp) => emp.id === selectedEmployeeId)?.name
      : !allowRecipientSelection
        ? currentUserName
        : undefined;

  const recipientReady = allowRecipientSelection ? Boolean(selectedEmployeeId) : true;
  const fileReady = Boolean(selectedFile);
  const submitDisabled =
    !recipientReady ||
    !fileReady ||
    !selectedDocumentType ||
    isUploading ||
    isOptimizing ||
    Boolean(fileError);

  const recipientStatus: "done" | "active" | "pending" = recipientReady
    ? "done"
    : "active";
  const fileStatus: "done" | "active" | "pending" = fileReady
    ? "done"
    : recipientReady
      ? "active"
      : "pending";
  const validationStatus: "done" | "active" | "pending" =
    fileReady && !fileError ? "done" : fileReady ? "active" : "pending";

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 lg:space-y-8">
      <UploadHero variant="desktop" scope={scope} recipientName={recipientName} />

      <UploadScopeCard activeRole={role} />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Card className="border-border/70 shadow-sm">
          <div className="border-b border-border/60 bg-[#F8FAFC] px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Cofre de envio
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[#0F172A]">
              Destinatário, arquivo e validação
            </h2>
          </div>

          <CardContent className="space-y-6 px-5 py-5">
            <div className="grid grid-cols-3 gap-3 rounded-xl border border-border/60 bg-[#F8FAFC] px-3 py-3">
              <Step index={1} title="Destinatário" status={recipientStatus} />
              <Step index={2} title="Arquivo" status={fileStatus} />
              <Step index={3} title="Validação" status={validationStatus} />
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">
                1. Destinatário
              </Label>

              {allowRecipientSelection ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="upload-employee-status"
                      className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8]"
                    >
                      Status do colaborador
                    </Label>
                    <Select value={activeEmployeeFilter} onValueChange={onActiveEmployeeFilterChange}>
                      <SelectTrigger id="upload-employee-status" className="h-11">
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
                      htmlFor="upload-employee"
                      className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8]"
                    >
                      Colaborador
                    </Label>
                    <Select
                      value={selectedEmployeeId}
                      onValueChange={onSelectEmployee}
                      disabled={isFetchingEmployees}
                    >
                      <SelectTrigger id="upload-employee" className="h-11">
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
                </div>
              ) : (
                <div className="rounded-xl border border-[#99F6E4] bg-[#F0FDFA] px-4 py-3 text-sm text-[#115E59]">
                  <p className="font-semibold">Destino: próprio perfil</p>
                  <p className="mt-0.5 text-xs leading-5 text-[#0F766E]">
                    {currentUserName
                      ? `Documento será enviado para ${currentUserName}.`
                      : "Documento será enviado para o colaborador da sessão."}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">
                Tipo documental
              </Label>
              <DocumentTypeChips
                value={selectedDocumentType}
                onChange={onSelectDocumentType}
                variant="desktop"
                disabled={isUploading}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">
                2. Arquivo
              </Label>
              <UploadDropzone
                variant="desktop"
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
            </div>

            <div className="flex flex-col gap-2 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onRemoveFile}
                disabled={!selectedFile || isUploading}
                className="h-11 gap-1 border-[#D8E2EC] bg-white text-[#102A43] hover:bg-[#F4F6F9]"
              >
                <Eraser className="h-4 w-4" />
                Limpar arquivo
              </Button>
              <Button
                type="button"
                onClick={onSubmit}
                disabled={submitDisabled}
                className="h-11 gap-1 bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
              >
                <Send className="h-4 w-4" />
                {isUploading ? "Enviando..." : "Enviar documento"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-border/70 shadow-sm">
            <div className="border-b border-border/60 bg-[#F8FAFC] px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                Prévia
              </p>
              <h3 className="mt-1 text-base font-semibold text-[#0F172A]">Resumo do envio</h3>
            </div>
            <CardContent className="space-y-3 px-5 py-5 text-sm">
              <div className="rounded-xl border border-border/60 bg-[#F8FAFC] px-3 py-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
                  Destinatário
                </p>
                <p className="mt-1 text-[#0F172A]">
                  {recipientName ?? <span className="text-[#94A3B8]">Aguardando seleção</span>}
                </p>
              </div>

              <div className="rounded-xl border border-border/60 bg-[#F8FAFC] px-3 py-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
                  Arquivo
                </p>
                <p className="mt-1 truncate text-[#0F172A]" title={selectedFile?.name}>
                  {selectedFile?.name ?? <span className="text-[#94A3B8]">Nenhum arquivo selecionado</span>}
                </p>
                {selectedFile ? (
                  <p className="mt-0.5 text-xs text-[#64748B]">
                    {formatFileSize(selectedFile.size)}
                  </p>
                ) : null}
              </div>

              <div className="rounded-xl border border-border/60 bg-[#F8FAFC] px-3 py-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
                  Validação
                </p>
                {fileError ? (
                  <p className="mt-1 text-[#DC2626]">{fileError}</p>
                ) : selectedFile ? (
                  <p className="mt-1 text-[#15803D]">Arquivo válido para envio.</p>
                ) : (
                  <p className="mt-1 text-[#94A3B8]">Sem arquivo para validar.</p>
                )}
              </div>

              {lastUploadAt ? (
                <Badge className="border border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D]">
                  Último envio: {lastUploadAt.toLocaleTimeString("pt-BR")}
                </Badge>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardContent className="space-y-2 px-5 py-5 text-xs leading-5 text-[#475569]">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0F172A]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#2563EB]" />
                Governança
              </p>
              <p>
                Documentos pessoais são dados sensíveis. O envio respeita o seu escopo de permissão e fica
                registrado para fins de auditoria.
              </p>
              <p>{scope.restriction}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UploadDesktopView;
