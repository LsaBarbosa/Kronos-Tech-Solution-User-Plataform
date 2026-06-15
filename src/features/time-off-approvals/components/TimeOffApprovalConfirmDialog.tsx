import { Loader2, ShieldCheck, ThumbsUp, TriangleAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { TimeOffApprovalViewModel, TimeOffDecisionAction } from "../types";

interface TimeOffApprovalConfirmDialogProps {
  request: TimeOffApprovalViewModel | null;
  action: TimeOffDecisionAction | null;
  isBusy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const TimeOffApprovalConfirmDialog = ({
  request,
  action,
  isBusy,
  onCancel,
  onConfirm,
}: TimeOffApprovalConfirmDialogProps) => {
  const isApprove = action === "approve";
  const open = Boolean(request && action);

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onCancel() : undefined)}>
      <DialogContent className="w-[92vw] max-w-lg rounded-2xl border-border/70 p-0 shadow-2xl">
        <DialogHeader
          className={cn(
            "border-b border-border/60 px-5 py-4",
            isApprove ? "bg-[#F0FDF4]" : "bg-[#FEF2F2]"
          )}
        >
          <DialogTitle className="flex items-start gap-3 text-lg font-semibold leading-tight text-[#0F172A]">
            <span
              aria-hidden="true"
              className={cn(
                "rounded-full p-2",
                isApprove ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#FEE2E2] text-[#DC2626]"
              )}
            >
              {isApprove ? <ThumbsUp className="h-4 w-4" /> : <TriangleAlert className="h-4 w-4" />}
            </span>
            {isApprove ? "Aprovar abono" : "Rejeitar abono"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-5 py-5">
          <p className="text-sm leading-6 text-[#475569]">
            {isApprove
              ? "Ao confirmar, o abono será aplicado ao registro de ponto e as horas serão atualizadas. A ação fica registrada para auditoria."
              : "Ao confirmar, o abono será rejeitado. O registro de ponto permanecerá sem alteração. A ação fica registrada para auditoria."}
          </p>

          {request ? (
            <div className="space-y-3 rounded-2xl border border-border/60 bg-[#F8FAFC] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]">
                  {request.kindLabel}
                </Badge>
                <Badge variant="outline" className="border-border/70 text-[11px]">
                  Registro #{request.record.timeRecordId}
                </Badge>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#0F172A]">{request.employeeName}</p>
                <p className="text-xs text-[#475569]">
                  {request.formattedStartDate} · {request.startHour} → {request.formattedEndDate} · {request.endHour}
                </p>
                <p className="text-xs text-[#475569]">Horas afetadas: <span className="font-semibold text-[#0F172A]">{request.hoursWork || "—"}</span></p>
              </div>

              <div className="flex items-start gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-[11px] leading-5 text-[#475569]">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2563EB]" />
                <span>
                  {isApprove
                    ? "Efeito: abono aplicado, saldo/horas recalculadas no registro afetado."
                    : "Efeito: abono não aplicado. Justifique no histórico operacional se necessário."}
                </span>
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter className="border-t border-border/60 bg-[#F8FAFC] px-5 py-4">
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isBusy}
              className="h-11 w-full"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isBusy}
              className={cn(
                "h-11 w-full gap-1 text-white",
                isApprove ? "bg-[#16A34A] hover:bg-[#15803D]" : "bg-[#DC2626] hover:bg-[#B91C1C]"
              )}
            >
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : isApprove ? (
                <ThumbsUp className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
              {isApprove ? "Confirmar aprovação" : "Confirmar rejeição"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TimeOffApprovalConfirmDialog;
