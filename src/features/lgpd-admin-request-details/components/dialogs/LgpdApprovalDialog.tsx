import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { UseLgpdCaseDetailsReturn } from "../../hooks/useLgpdCaseDetails";
import { FieldErrorMessage } from "./FieldErrorMessage";

interface LgpdApprovalDialogProps {
  viewModel: UseLgpdCaseDetailsReturn;
}

export const LgpdApprovalDialog = ({ viewModel }: LgpdApprovalDialogProps) => {
  const {
    openDialog,
    closeDialog,
    approvalDraft,
    updateApprovalDraft,
    fieldErrors,
    clearFieldError,
    handleApproveExport,
    actionLoading,
  } = viewModel;

  const isOpen = openDialog === "approval";
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
            <ShieldCheck className="h-5 w-5 text-[#16A34A]" />
            Aprovar exportação
          </DialogTitle>
          <DialogDescription className="text-sm text-[#64748B]">
            Registre a justificativa e o escopo aprovado antes de liberar a exportação.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="approval-justification" className="text-sm font-semibold text-[#0F172A]">
              Justificativa da aprovação *
            </Label>
            <Textarea
              id="approval-justification"
              value={approvalDraft.justification}
              onChange={(event) => {
                updateApprovalDraft({ justification: event.target.value });
                clearFieldError("approvalJustification");
              }}
              aria-invalid={!!fieldErrors.approvalJustification}
              aria-describedby={
                fieldErrors.approvalJustification ? "approvalJustification-error" : undefined
              }
              className={fieldClass(!!fieldErrors.approvalJustification)}
              rows={3}
              disabled={actionLoading}
            />
            <FieldErrorMessage
              id="approvalJustification-error"
              message={fieldErrors.approvalJustification}
            />
          </div>

          <div>
            <Label htmlFor="approval-scope" className="text-sm font-semibold text-[#0F172A]">
              Escopo aprovado *
            </Label>
            <Textarea
              id="approval-scope"
              value={approvalDraft.scope}
              onChange={(event) => {
                updateApprovalDraft({ scope: event.target.value });
                clearFieldError("approvalScope");
              }}
              aria-invalid={!!fieldErrors.approvalScope}
              aria-describedby={fieldErrors.approvalScope ? "approvalScope-error" : undefined}
              className={fieldClass(!!fieldErrors.approvalScope)}
              rows={3}
              disabled={actionLoading}
            />
            <FieldErrorMessage id="approvalScope-error" message={fieldErrors.approvalScope} />
          </div>

          <div>
            <Label htmlFor="approval-internal" className="text-sm font-semibold text-[#0F172A]">
              Observações internas
            </Label>
            <Textarea
              id="approval-internal"
              value={approvalDraft.internalNotes}
              onChange={(event) => updateApprovalDraft({ internalNotes: event.target.value })}
              className={fieldClass(false)}
              rows={3}
              disabled={actionLoading}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={closeDialog}
            disabled={actionLoading}
            className="rounded-2xl border-[#E2E8F0] text-[#0F172A]"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => void handleApproveExport()}
            disabled={actionLoading}
            className="gap-2 rounded-2xl bg-[#16A34A] text-white hover:bg-[#15803D]"
          >
            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Confirmar aprovação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LgpdApprovalDialog;
