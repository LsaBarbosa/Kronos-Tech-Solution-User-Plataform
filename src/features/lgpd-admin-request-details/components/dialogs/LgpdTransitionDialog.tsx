import { Loader2 } from "lucide-react";
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
import type { LgpdRequestStatus } from "@/service/lgpd.service";
import { getStatusTone } from "@/features/lgpd-admin-requests/utils/lgpd-formatters";
import type { UseLgpdCaseDetailsReturn } from "../../hooks/useLgpdCaseDetails";
import { FieldErrorMessage } from "./FieldErrorMessage";

interface LgpdTransitionDialogProps {
  viewModel: UseLgpdCaseDetailsReturn;
}

export const LgpdTransitionDialog = ({ viewModel }: LgpdTransitionDialogProps) => {
  const {
    openDialog,
    closeDialog,
    transitionDraft,
    updateTransitionDraft,
    fieldErrors,
    clearFieldError,
    handleTransition,
    actionLoading,
    availableAdvancedTransitions,
  } = viewModel;

  const isOpen = openDialog === "transition";
  const fieldClass = (hasError: boolean) =>
    cn(
      "rounded-2xl border bg-white text-sm",
      hasError ? "border-[#FECACA] focus-visible:ring-[#DC2626]" : "border-[#E2E8F0]"
    );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? closeDialog() : undefined)}>
      <DialogContent className="max-w-xl rounded-2xl border border-[#E2E8F0] bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg text-[#0F172A]">Avançar análise manualmente</DialogTitle>
          <DialogDescription className="text-sm text-[#64748B]">
            Use apenas quando precisar selecionar uma etapa técnica específica.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="transition-status" className="text-sm font-semibold text-[#0F172A]">
              Próxima etapa *
            </Label>
            <select
              id="transition-status"
              value={transitionDraft.nextStatus ?? ""}
              onChange={(event) => {
                updateTransitionDraft({
                  nextStatus: (event.target.value || null) as LgpdRequestStatus | null,
                });
                clearFieldError("transitionStatus");
              }}
              aria-invalid={!!fieldErrors.transitionStatus}
              aria-describedby={
                fieldErrors.transitionStatus ? "transitionStatus-error" : undefined
              }
              className={cn(
                "block h-11 w-full appearance-none px-3 text-sm text-[#0F172A] outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]",
                fieldClass(!!fieldErrors.transitionStatus)
              )}
              disabled={actionLoading}
            >
              <option value="">Selecione a próxima etapa</option>
              {availableAdvancedTransitions.map((status) => (
                <option key={status} value={status}>
                  {getStatusTone(status).label}
                </option>
              ))}
            </select>
            <FieldErrorMessage
              id="transitionStatus-error"
              message={fieldErrors.transitionStatus}
            />
          </div>

          {transitionDraft.nextStatus === "REJECTED" ? (
            <div>
              <Label htmlFor="transition-rejection" className="text-sm font-semibold text-[#0F172A]">
                Motivo da rejeição *
              </Label>
              <Input
                id="transition-rejection"
                type="text"
                value={transitionDraft.rejectionReason}
                onChange={(event) => {
                  updateTransitionDraft({ rejectionReason: event.target.value });
                  clearFieldError("rejectionReason");
                }}
                placeholder="Ex: Solicitação inválida"
                aria-invalid={!!fieldErrors.rejectionReason}
                aria-describedby={
                  fieldErrors.rejectionReason ? "transition-rejectionReason-error" : undefined
                }
                className={fieldClass(!!fieldErrors.rejectionReason)}
                disabled={actionLoading}
              />
              <FieldErrorMessage
                id="transition-rejectionReason-error"
                message={fieldErrors.rejectionReason}
              />
            </div>
          ) : null}

          {transitionDraft.nextStatus &&
          (["COMPLETED", "PARTIALLY_COMPLETED"] as LgpdRequestStatus[]).includes(
            transitionDraft.nextStatus
          ) ? (
            <div>
              <Label htmlFor="transition-notes" className="text-sm font-semibold text-[#0F172A]">
                Notas de resolução *
              </Label>
              <Textarea
                id="transition-notes"
                value={transitionDraft.notes}
                onChange={(event) => {
                  updateTransitionDraft({ notes: event.target.value });
                  clearFieldError("transitionNotes");
                }}
                placeholder="Descreva a resolução"
                aria-invalid={!!fieldErrors.transitionNotes}
                aria-describedby={
                  fieldErrors.transitionNotes ? "transitionNotes-error" : undefined
                }
                className={fieldClass(!!fieldErrors.transitionNotes)}
                rows={3}
                disabled={actionLoading}
              />
              <FieldErrorMessage
                id="transitionNotes-error"
                message={fieldErrors.transitionNotes}
              />
            </div>
          ) : null}
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
            onClick={() => void handleTransition()}
            disabled={actionLoading}
            className="gap-2 rounded-2xl bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
          >
            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Confirmar avanço
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LgpdTransitionDialog;
