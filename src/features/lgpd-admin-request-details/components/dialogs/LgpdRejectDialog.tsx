import { Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface LgpdRejectDialogProps {
  viewModel: UseLgpdCaseDetailsReturn;
}

export const LgpdRejectDialog = ({ viewModel }: LgpdRejectDialogProps) => {
  const {
    openDialog,
    closeDialog,
    rejectDraft,
    updateRejectDraft,
    fieldErrors,
    clearFieldError,
    handleReject,
    actionLoading,
  } = viewModel;

  const isOpen = openDialog === "reject";
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
            <XCircle className="h-5 w-5 text-[#DC2626]" />
            Rejeitar solicitação
          </DialogTitle>
          <DialogDescription className="text-sm text-[#64748B]">
            Registre o motivo e uma nota pública compreensível para o titular.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="reject-reason" className="text-sm font-semibold text-[#0F172A]">
              Motivo da rejeição *
            </Label>
            <Input
              id="reject-reason"
              type="text"
              value={rejectDraft.reason}
              onChange={(event) => {
                updateRejectDraft({ reason: event.target.value });
                clearFieldError("rejectionReason");
              }}
              placeholder="Ex: Solicitação inválida"
              aria-invalid={!!fieldErrors.rejectionReason}
              aria-describedby={
                fieldErrors.rejectionReason ? "rejectionReason-error" : undefined
              }
              className={fieldClass(!!fieldErrors.rejectionReason)}
              disabled={actionLoading}
            />
            <FieldErrorMessage
              id="rejectionReason-error"
              message={fieldErrors.rejectionReason}
            />
          </div>

          <div>
            <Label htmlFor="reject-public" className="text-sm font-semibold text-[#0F172A]">
              Nota pública *
            </Label>
            <Textarea
              id="reject-public"
              value={rejectDraft.publicNote}
              onChange={(event) => {
                updateRejectDraft({ publicNote: event.target.value });
                clearFieldError("rejectionPublicNote");
              }}
              placeholder="Explique a rejeição em linguagem clara para o titular."
              aria-invalid={!!fieldErrors.rejectionPublicNote}
              aria-describedby={
                fieldErrors.rejectionPublicNote ? "rejectionPublicNote-error" : undefined
              }
              className={fieldClass(!!fieldErrors.rejectionPublicNote)}
              rows={3}
              disabled={actionLoading}
            />
            <FieldErrorMessage
              id="rejectionPublicNote-error"
              message={fieldErrors.rejectionPublicNote}
            />
          </div>

          <div>
            <Label htmlFor="reject-internal" className="text-sm font-semibold text-[#0F172A]">
              Observações internas
            </Label>
            <Textarea
              id="reject-internal"
              value={rejectDraft.internalNote}
              onChange={(event) => updateRejectDraft({ internalNote: event.target.value })}
              placeholder="Observações internas da revisão"
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
            onClick={() => void handleReject()}
            disabled={actionLoading}
            className="gap-2 rounded-2xl bg-[#DC2626] text-white hover:bg-[#B91C1C]"
          >
            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Confirmar rejeição
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LgpdRejectDialog;
