import { CheckCircle2, Loader2 } from "lucide-react";
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

interface LgpdCompletionDialogProps {
  viewModel: UseLgpdCaseDetailsReturn;
}

export const LgpdCompletionDialog = ({ viewModel }: LgpdCompletionDialogProps) => {
  const {
    openDialog,
    closeDialog,
    completionDraft,
    updateCompletionDraft,
    fieldErrors,
    clearFieldError,
    handleCompletion,
    actionLoading,
  } = viewModel;

  const isOpen = openDialog === "completion";
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
            <CheckCircle2 className="h-5 w-5 text-[#16A34A]" />
            Concluir solicitação
          </DialogTitle>
          <DialogDescription className="text-sm text-[#64748B]">
            Informe a nota pública que ficará visível para o titular.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="completion-public" className="text-sm font-semibold text-[#0F172A]">
              Nota pública *
            </Label>
            <Textarea
              id="completion-public"
              value={completionDraft.publicNotes}
              onChange={(event) => {
                updateCompletionDraft({ publicNotes: event.target.value });
                clearFieldError("completionPublicNotes");
              }}
              aria-invalid={!!fieldErrors.completionPublicNotes}
              aria-describedby={
                fieldErrors.completionPublicNotes ? "completionPublicNotes-error" : undefined
              }
              className={fieldClass(!!fieldErrors.completionPublicNotes)}
              rows={3}
              disabled={actionLoading}
            />
            <FieldErrorMessage
              id="completionPublicNotes-error"
              message={fieldErrors.completionPublicNotes}
            />
          </div>

          <div>
            <Label htmlFor="completion-internal" className="text-sm font-semibold text-[#0F172A]">
              Observações internas
            </Label>
            <Textarea
              id="completion-internal"
              value={completionDraft.internalNotes}
              onChange={(event) => updateCompletionDraft({ internalNotes: event.target.value })}
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
            onClick={() => void handleCompletion()}
            disabled={actionLoading}
            className="gap-2 rounded-2xl bg-[#16A34A] text-white hover:bg-[#15803D]"
          >
            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Concluir solicitação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LgpdCompletionDialog;
