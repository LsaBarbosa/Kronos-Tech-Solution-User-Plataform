import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { UseLgpdCaseDetailsReturn } from "../../hooks/useLgpdCaseDetails";
import { FieldErrorMessage } from "./FieldErrorMessage";

interface LgpdExportDialogProps {
  viewModel: UseLgpdCaseDetailsReturn;
}

export const LgpdExportDialog = ({ viewModel }: LgpdExportDialogProps) => {
  const {
    openDialog,
    closeDialog,
    exportDraft,
    updateExportDraft,
    fieldErrors,
    clearFieldError,
    handleExport,
    isExporting,
  } = viewModel;

  const isOpen = openDialog === "export";
  const fieldClass = (hasError: boolean) =>
    cn(
      "rounded-2xl border bg-white text-sm",
      hasError ? "border-[#FECACA] focus-visible:ring-[#DC2626]" : "border-[#E2E8F0]"
    );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? closeDialog() : undefined)}>
      <DialogContent className="max-w-xl rounded-2xl border border-[#E2E8F0] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg text-[#0F172A]">
            <Download className="h-5 w-5 text-[#16A34A]" />
            Exportar Dados da Solicitação
          </DialogTitle>
          <DialogDescription className="text-sm text-[#64748B]">
            Preencha os campos obrigatórios para realizar a exportação dos dados revisados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="export-legal" className="text-sm font-semibold text-[#0F172A]">
              Fundamento Legal *
            </Label>
            <Input
              id="export-legal"
              type="text"
              value={exportDraft.legalBasis}
              onChange={(event) => {
                updateExportDraft({ legalBasis: event.target.value });
                clearFieldError("exportLegalBasis");
              }}
              placeholder="Ex: Art. 7, II, LGPD"
              aria-invalid={!!fieldErrors.exportLegalBasis}
              aria-describedby={
                fieldErrors.exportLegalBasis ? "exportLegalBasis-error" : undefined
              }
              className={fieldClass(!!fieldErrors.exportLegalBasis)}
              disabled={isExporting}
            />
            <FieldErrorMessage
              id="exportLegalBasis-error"
              message={fieldErrors.exportLegalBasis}
            />
          </div>

          <div>
            <Label htmlFor="export-operational" className="text-sm font-semibold text-[#0F172A]">
              Motivo Operacional *
            </Label>
            <Textarea
              id="export-operational"
              value={exportDraft.operationalReason}
              onChange={(event) => {
                updateExportDraft({ operationalReason: event.target.value });
                clearFieldError("exportOperationalReason");
              }}
              placeholder="Descreva o motivo da exportação"
              aria-invalid={!!fieldErrors.exportOperationalReason}
              aria-describedby={
                fieldErrors.exportOperationalReason
                  ? "exportOperationalReason-error"
                  : undefined
              }
              className={fieldClass(!!fieldErrors.exportOperationalReason)}
              rows={3}
              disabled={isExporting}
            />
            <FieldErrorMessage
              id="exportOperationalReason-error"
              message={fieldErrors.exportOperationalReason}
            />
          </div>

          <div>
            <Label htmlFor="export-reviewer" className="text-sm font-semibold text-[#0F172A]">
              Notas do Revisor *
            </Label>
            <Textarea
              id="export-reviewer"
              value={exportDraft.reviewerNotes}
              onChange={(event) => {
                updateExportDraft({ reviewerNotes: event.target.value });
                clearFieldError("exportReviewerNotes");
              }}
              placeholder="Justificativa de revisão e aprovação"
              aria-invalid={!!fieldErrors.exportReviewerNotes}
              aria-describedby={
                fieldErrors.exportReviewerNotes ? "exportReviewerNotes-error" : undefined
              }
              className={fieldClass(!!fieldErrors.exportReviewerNotes)}
              rows={3}
              disabled={isExporting}
            />
            <FieldErrorMessage
              id="exportReviewerNotes-error"
              message={fieldErrors.exportReviewerNotes}
            />
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2">
            <Checkbox
              id="export-precise"
              checked={exportDraft.includePreciseGeolocation}
              onCheckedChange={(checked) =>
                updateExportDraft({ includePreciseGeolocation: checked === true })
              }
              disabled={isExporting}
            />
            <Label htmlFor="export-precise" className="text-sm text-[#334155]">
              Incluir geolocalização precisa
            </Label>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={closeDialog}
            disabled={isExporting}
            className="rounded-2xl border-[#E2E8F0] text-[#0F172A]"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => void handleExport()}
            disabled={isExporting}
            className="gap-2 rounded-2xl bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isExporting ? "Exportando..." : "Exportar Dados"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LgpdExportDialog;
