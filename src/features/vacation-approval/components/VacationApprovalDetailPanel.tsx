import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, ShieldAlert, X } from "lucide-react";
import type { VacationApprovalViewModel } from "../types";
import {
  getVacationApprovalStatusAccent,
  getVacationApprovalStatusTone,
} from "../utils/vacation-approval-formatters";

interface VacationApprovalDetailPanelProps {
  request: VacationApprovalViewModel | null;
  onApprove: (request: VacationApprovalViewModel) => void;
  onReject: (request: VacationApprovalViewModel) => void;
  isBusy?: boolean;
}

type MetricTone = "primary" | "emerald" | "violet" | "amber";

const MetricBlock = ({
  title,
  value,
  tone,
}: {
  title: string;
  value: string | number;
  tone: MetricTone;
}) => {
  const toneStyles: Record<MetricTone, string> = {
    primary: "border-blue-100 bg-blue-50 text-blue-700",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
    violet: "border-violet-100 bg-violet-50 text-violet-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
  };

  return (
    <div className={cn("rounded-2xl border p-4", toneStyles[tone])}>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-current/70">{title}</p>
      <p className="mt-1 text-2xl font-semibold leading-none">{value}</p>
    </div>
  );
};

export const VacationApprovalDetailPanel = ({
  request,
  onApprove,
  onReject,
  isBusy = false,
}: VacationApprovalDetailPanelProps) => {
  return (
    <Card
      id="detail"
      className="h-fit self-start border border-border bg-card shadow-sm"
    >
      <CardHeader className="space-y-4 border-b border-border bg-gradient-to-br from-[#F8FAFC] via-white to-[#E8F0FF] p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-base font-semibold text-primary">
              {request?.employeeInitials ?? "KR"}
            </div>
            <div className="min-w-0">
              <CardTitle className="break-words text-2xl leading-tight text-slate-900">
                {request?.employeeName ?? "Selecione uma solicitação"}
              </CardTitle>
              <p className="mt-1 text-sm text-slate-600">
                {request
                  ? `${request.calendarDays} dias corridos · ${request.businessDays} úteis estimados`
                  : "Escolha um lote para analisar impacto, período e status."}
              </p>
            </div>
          </div>
          {request && (
            <Badge variant="outline" className={cn("rounded-full border px-3 py-1 text-xs font-semibold", getVacationApprovalStatusTone(request.rawStatus))}>
              <span className={cn("mr-2 h-2 w-2 rounded-full", getVacationApprovalStatusAccent(request.rawStatus))} aria-hidden="true" />
              {request.statusLabel}
            </Badge>
          )}
        </div>

        {request && (
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricBlock title="Dias corridos" value={request.calendarDays} tone="primary" />
            <MetricBlock title="Úteis estimados" value={request.businessDays} tone="emerald" />
            <MetricBlock title="Finais de semana" value={request.weekendDays} tone="violet" />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4 p-5">
        {!request ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-5 text-sm text-muted-foreground">
            Nenhuma solicitação selecionada.
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Análise antes da decisão</h3>
              <div className="space-y-3">
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Período solicitado</p>
                  <p className="mt-1 text-base font-semibold text-foreground">{request.periodLabel}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Status atual</p>
                  <p className="mt-1 text-base font-semibold text-foreground">{request.statusLabel}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Resultado ao aprovar</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-medium text-emerald-700">
                    <Check className="h-4 w-4" aria-hidden="true" />
                    {request.recordsCount} registros passam para Aprovada
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Resultado ao rejeitar</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-medium text-rose-700">
                    <X className="h-4 w-4" aria-hidden="true" />
                    {request.recordsCount} registros passam para Rejeitada
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
                <p className="text-sm leading-relaxed text-amber-900">
                  Aprovar ou rejeitar esta solicitação altera o lote inteiro e gera trilha operacional. Confirme
                  o impacto antes de seguir.
                </p>
              </div>
            </div>

            <div id="decision" className="grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                variant="destructive"
                className="h-12 rounded-2xl text-base font-semibold"
                disabled={!request.canDecide || isBusy}
                onClick={() => onReject(request)}
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Rejeitar lote
              </Button>
              <Button
                type="button"
                variant="success"
                className="h-12 rounded-2xl text-base font-semibold"
                disabled={!request.canDecide || isBusy}
                onClick={() => onApprove(request)}
              >
                <Check className="h-4 w-4" aria-hidden="true" />
                Aprovar lote
              </Button>
            </div>

            {!request.canDecide && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                Solicitação finalizada. Não há ação disponível para este lote.
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
