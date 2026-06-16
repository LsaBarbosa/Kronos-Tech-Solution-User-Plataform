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
import { cn } from "@/lib/utils";
import type { UseLgpdCaseDetailsReturn } from "../../hooks/useLgpdCaseDetails";
import { FieldErrorMessage } from "./FieldErrorMessage";

interface LgpdCancelDialogProps {
  viewModel: UseLgpdCaseDetailsReturn;
}

export const LgpdCancelDialog = ({ viewModel }: LgpdCancelDialogProps) => {
  const {
    openDialog,
    closeDialog,
    cancelReason,
    setCancelReason,
    fieldErrors,
    clearFieldError,
    handleCancel,
    actionLoading,
  } = viewModel;

  const isOpen = openDialog === "cancel";
  const fieldClass = (hasError: boolean) =>
    cn(
      "rounded-2xl border bg-white text-sm",
      hasError ? "border-[#FECACA] focus-visible:ring-[#DC2626]" : "border-[#E2E8F0]"
    );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? closeDialog() : undefined)}>
      <DialogContent className="max-w-xl rounded-2xl border border-[#E2E8F0] bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg text-[#0F172A]">Cancelar solicitação</DialogTitle>
          <DialogDescription className="text-sm text-[#64748B]">
            Registre o motivo do cancelamento administrativo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="cancel-reason" className="text-sm font-semibold text-[#0F172A]">
            Motivo do cancelamento *
          </Label>
          <Input
            id="cancel-reason"
            type="text"
            value={cancelReason}
            onChange={(event) => {
              setCancelReason(event.target.value);
              clearFieldError("cancelReason");
            }}
            placeholder="Explique o motivo do cancelamento"
            aria-invalid={!!fieldErrors.cancelReason}
            aria-describedby={fieldErrors.cancelReason ? "cancelReason-error" : undefined}
            className={fieldClass(!!fieldErrors.cancelReason)}
            disabled={actionLoading}
          />
          <FieldErrorMessage id="cancelReason-error" message={fieldErrors.cancelReason} />
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={closeDialog}
            disabled={actionLoading}
            className="rounded-2xl border-[#E2E8F0] text-[#0F172A]"
          >
            Voltar
          </Button>
          <Button
            type="button"
            onClick={() => void handleCancel()}
            disabled={actionLoading}
            className="gap-2 rounded-2xl bg-[#DC2626] text-white hover:bg-[#B91C1C]"
          >
            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Confirmar Cancelamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LgpdCancelDialog;
