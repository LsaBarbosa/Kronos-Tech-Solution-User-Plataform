import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Check, Loader2, X } from "lucide-react";
import type { VacationDecisionAction, VacationApprovalViewModel } from "../types";
import {
  getVacationApprovalStatusAccent,
  getVacationApprovalStatusTone,
} from "../utils/vacation-approval-formatters";

interface VacationDecisionDialogProps {
  open: boolean;
  action: VacationDecisionAction | null;
  request: VacationApprovalViewModel | null;
  isLoading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const ACTION_TEXT: Record<VacationDecisionAction, { title: string; confirm: string; tone: string; description: string }> = {
  approve: {
    title: "Confirmar aprovação do lote",
    confirm: "Aprovar lote",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
    description: "O status de todos os registros selecionados será convertido para Aprovada.",
  },
  reject: {
    title: "Confirmar rejeição do lote",
    confirm: "Rejeitar lote",
    tone: "border-rose-200 bg-rose-50 text-rose-800",
    description: "O status de todos os registros selecionados será convertido para Rejeitada.",
  },
};

export const VacationDecisionDialog = ({
  open,
  action,
  request,
  isLoading = false,
  onOpenChange,
  onConfirm,
}: VacationDecisionDialogProps) => {
  if (!action) {
    return null;
  }

  const actionData = ACTION_TEXT[action];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl overflow-hidden border-border bg-card p-0 sm:rounded-3xl">
        <div className="bg-[linear-gradient(135deg,#0B1220_0%,#101A33_55%,#1E3A8A_100%)] px-6 py-5 text-white">
          <DialogHeader className="space-y-3 text-left">
            <Badge variant="outline" className={cn("w-fit border-white/20 bg-white/10 text-white", actionData.tone)}>
              {action === "approve" ? "Aprovação" : "Rejeição"}
            </Badge>
            <DialogTitle className="text-2xl font-semibold">{actionData.title}</DialogTitle>
            <DialogDescription className="max-w-2xl text-sm leading-relaxed text-white/75">
              {actionData.description}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Colaborador</p>
              <p className="mt-1 text-base font-semibold text-foreground">{request?.employeeName ?? "-"}</p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Período</p>
              <p className="mt-1 text-base font-semibold text-foreground">{request?.periodLabel ?? "-"}</p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Registros afetados</p>
              <p className="mt-1 text-base font-semibold text-foreground">{request?.recordsCount ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Efeito no status</p>
              <p className="mt-1 flex items-center gap-2 text-base font-semibold text-foreground">
                <span className={cn("h-2.5 w-2.5 rounded-full", getVacationApprovalStatusAccent(action === "approve" ? "VACATION" : "VACATION_REJECTED"))} />
                {action === "approve" ? "Aprovada" : "Rejeitada"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="flex items-start gap-2 text-sm leading-relaxed text-amber-900">
              <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 rounded-full bg-amber-500" aria-hidden="true" />
              A decisão é sensível e será aplicada ao lote inteiro.
            </p>
          </div>
        </div>

        <DialogFooter className="border-t border-border bg-muted/30 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-2xl px-5"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant={action === "approve" ? "success" : "destructive"}
            className="h-11 rounded-2xl px-5"
            onClick={onConfirm}
            disabled={isLoading || !request?.canDecide}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : action === "approve" ? <Check className="h-4 w-4" aria-hidden="true" /> : <X className="h-4 w-4" aria-hidden="true" />}
            {actionData.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
