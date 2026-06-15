import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import type { VacationApprovalViewModel } from "../types";
import {
  getVacationApprovalStatusAccent,
  getVacationApprovalStatusTone,
} from "../utils/vacation-approval-formatters";

interface VacationApprovalStickyActionBarProps {
  request: VacationApprovalViewModel | null;
  onApprove: (request: VacationApprovalViewModel) => void;
  onReject: (request: VacationApprovalViewModel) => void;
  isBusy?: boolean;
}

export const VacationApprovalStickyActionBar = ({
  request,
  onApprove,
  onReject,
  isBusy = false,
}: VacationApprovalStickyActionBarProps) => {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden">
      <div className="space-y-3 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        {request ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{request.employeeName}</p>
                <p className="truncate text-xs text-muted-foreground">{request.periodLabel}</p>
              </div>
              <Badge variant="outline" className={cn("rounded-full border px-3 py-1 text-xs font-semibold", getVacationApprovalStatusTone(request.rawStatus))}>
                <span className={cn("mr-2 h-2 w-2 rounded-full", getVacationApprovalStatusAccent(request.rawStatus))} aria-hidden="true" />
                {request.statusLabel}
              </Badge>
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {request.calendarDays} dias corridos · {request.businessDays} úteis
              </p>
              <Badge variant="outline" className="rounded-full border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                Lote: {request.recordsCount} registros
              </Badge>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Selecione um lote para liberar as decisões.</div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="destructive"
            className="h-12 rounded-2xl text-base font-semibold"
            disabled={!request?.canDecide || isBusy}
            onClick={() => request && onReject(request)}
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Rejeitar
          </Button>
          <Button
            type="button"
            variant="success"
            className="h-12 rounded-2xl text-base font-semibold"
            disabled={!request?.canDecide || isBusy}
            onClick={() => request && onApprove(request)}
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            Aprovar férias
          </Button>
        </div>

        {request && !request.canDecide && (
          <p className="text-xs text-muted-foreground">Ação finalizada. Não há botão ativo para este lote.</p>
        )}
      </div>
    </div>
  );
};
