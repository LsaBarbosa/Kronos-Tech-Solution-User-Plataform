import { Loader2, Save, ShieldAlert, TriangleAlert, ZapOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { DetailedReportItem } from "@/utils/report-utils";
import {
  formatRecordDate,
  getStatusTone,
  type TargetStatus,
} from "./status-registro-helpers";
import type { DecisionAction } from "./useStatusRegistroViewModel";

interface StatusConfirmDialogProps {
  action: DecisionAction | null;
  record: DetailedReportItem | null;
  newStatus: TargetStatus | "";
  isSaving: boolean;
  isToggling: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const StatusConfirmDialog = ({
  action,
  record,
  newStatus,
  isSaving,
  isToggling,
  onCancel,
  onConfirm,
}: StatusConfirmDialogProps) => {
  const open = action !== null && record !== null;
  if (!open || !record) {
    return (
      <Dialog open={false} onOpenChange={() => onCancel()}>
        <DialogContent className="sr-only" />
      </Dialog>
    );
  }

  const isSave = action === "save";
  const busy = isSaving || isToggling;
  const currentTone = getStatusTone(record.statusRecord);
  const newTone = newStatus ? getStatusTone(newStatus) : null;
  const toggleAction = record.active === false ? "ativar" : "inativar";

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? onCancel() : undefined)}>
      <DialogContent className="w-[92vw] max-w-lg rounded-2xl border-border/70 p-0 shadow-2xl">
        <DialogHeader
          className={cn(
            "border-b border-border/60 px-5 py-4",
            isSave ? "bg-[#EFF6FF]" : "bg-[#FEF2F2]"
          )}
        >
          <DialogTitle className="flex items-start gap-3 text-lg font-semibold leading-tight text-[#0F172A]">
            <span
              aria-hidden="true"
              className={cn(
                "rounded-full p-2",
                isSave ? "bg-[#DBEAFE] text-[#1D4ED8]" : "bg-[#FEE2E2] text-[#DC2626]"
              )}
            >
              {isSave ? <Save className="h-4 w-4" /> : <TriangleAlert className="h-4 w-4" />}
            </span>
            {isSave
              ? "Confirmar alteração de status"
              : `Confirmar ${toggleAction} do registro`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-5 py-5">
          <p className="text-sm leading-6 text-[#475569]">
            {isSave
              ? "Você está prestes a alterar o status do registro de ponto. A operação afeta jornada e indicadores e fica registrada para auditoria."
              : `Você está prestes a ${toggleAction} este registro de ponto. A operação fica registrada para auditoria.`}
          </p>

          <div className="space-y-3 rounded-2xl border border-border/60 bg-[#F8FAFC] p-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#0F172A]">
                {record.employeeData?.employeeName ?? "—"}
              </p>
              <p className="text-xs text-[#475569]">
                Data: <span className="font-semibold text-[#0F172A]">{formatRecordDate(record.startWork)}</span>
              </p>
              <p className="text-xs text-[#475569]">
                Registro: <span className="font-mono text-[#0F172A]">#{record.timeRecordId ?? "—"}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#475569]">Status atual:</span>
              <Badge className={currentTone.badgeClass}>{currentTone.label}</Badge>
              {isSave && newTone ? (
                <>
                  <span className="text-[#94A3B8]">→</span>
                  <span className="text-[#475569]">Novo:</span>
                  <Badge className={newTone.badgeClass}>{newTone.label}</Badge>
                </>
              ) : null}
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-[#FCD34D] bg-[#FEF3C7] px-3 py-2.5 text-[11px] leading-5 text-[#92400E]">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              {isSave
                ? "Impacto trabalhista: a mudança altera saldo/horas e fica visível para auditoria."
                : record.active === false
                  ? "Impacto trabalhista: o registro volta a contar como ativo no histórico do colaborador."
                  : "Impacto trabalhista: o registro deixa de contar nos cálculos vigentes."}
            </span>
          </div>
        </div>

        <DialogFooter className="border-t border-border/60 bg-[#F8FAFC] px-5 py-4">
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={busy}
              className="h-11 w-full"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className={cn(
                "h-11 w-full gap-1 text-white",
                isSave
                  ? "bg-[#2563EB] hover:bg-[#1D4ED8]"
                  : "bg-[#DC2626] hover:bg-[#B91C1C]"
              )}
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isSave ? (
                <Save className="h-4 w-4" />
              ) : (
                <ZapOff className="h-4 w-4" />
              )}
              {isSave
                ? "Confirmar alteração"
                : record.active === false
                  ? "Confirmar ativação"
                  : "Confirmar inativação"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StatusConfirmDialog;
