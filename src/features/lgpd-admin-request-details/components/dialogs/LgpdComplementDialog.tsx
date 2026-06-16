import { Loader2, MessageSquareWarning } from "lucide-react";
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

interface LgpdComplementDialogProps {
  viewModel: UseLgpdCaseDetailsReturn;
}

export const LgpdComplementDialog = ({ viewModel }: LgpdComplementDialogProps) => {
  const {
    openDialog,
    closeDialog,
    complementMessage,
    setComplementMessage,
    fieldErrors,
    clearFieldError,
    handleRequestComplement,
    actionLoading,
  } = viewModel;

  const isOpen = openDialog === "complement";
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
            <MessageSquareWarning className="h-5 w-5 text-[#2563EB]" />
            Solicitar complemento ao titular
          </DialogTitle>
          <DialogDescription className="text-sm text-[#64748B]">
            Descreva quais informações adicionais são necessárias.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="complement-message" className="text-sm font-semibold text-[#0F172A]">
            Mensagem de solicitação *
          </Label>
          <Textarea
            id="complement-message"
            value={complementMessage}
            onChange={(event) => {
              setComplementMessage(event.target.value);
              clearFieldError("complementMessage");
            }}
            placeholder="Descreva quais informações adicionais são necessárias"
            aria-invalid={!!fieldErrors.complementMessage}
            aria-describedby={
              fieldErrors.complementMessage ? "complementMessage-error" : undefined
            }
            className={fieldClass(!!fieldErrors.complementMessage)}
            rows={4}
            disabled={actionLoading}
          />
          <FieldErrorMessage
            id="complementMessage-error"
            message={fieldErrors.complementMessage}
          />
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
            onClick={() => void handleRequestComplement()}
            disabled={actionLoading}
            className="gap-2 rounded-2xl bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
          >
            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Enviar solicitação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LgpdComplementDialog;
