import {
  AlertOctagon,
  ArrowRight,
  CalendarCheck,
  Check,
  Clock as ClockIcon,
  Loader2,
  ShieldCheck,
  TriangleAlert,
  UserCog,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TimeRecordApprovalResponse } from "@/types/recordApproval";
import {
  computeHoursDiff,
  formatDateLong,
  formatDateTime,
  getInitials,
  isPendingClosure,
} from "../utils/approval-formatters";

interface ApprovalDecisionPanelProps {
  variant: "desktop" | "mobile";
  request: TimeRecordApprovalResponse | null;
  isMutating: boolean;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

const ApprovalDecisionPanel = ({
  variant,
  request,
  isMutating,
  onApprove,
  onReject,
}: ApprovalDecisionPanelProps) => {
  if (!request) {
    return (
      <Card className="border-border/70 shadow-sm">
        <CardContent className="flex flex-col items-center gap-3 px-5 py-12 text-center text-[#64748B]">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1F5F9] text-[#94A3B8]"
          >
            <ShieldCheck className="h-6 w-6" />
          </span>
          <p className="text-sm font-semibold text-[#0F172A]">Nenhuma solicitação selecionada</p>
          <p className="max-w-md text-xs leading-5">
            Clique em um item da fila para visualizar atual × proposto e decidir a aprovação.
          </p>
        </CardContent>
      </Card>
    );
  }

  const pendingClosure = isPendingClosure(request);
  const currentDiff = computeHoursDiff(request.currentStartWork, request.currentEndWork);
  const newDiff = computeHoursDiff(request.newStartWork, request.newEndWork);

  return (
    <Card className="border-border/70 shadow-sm">
      <div className="border-b border-border/60 bg-[#F8FAFC] px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Solicitação selecionada
            </p>
            <h3 className="text-lg font-semibold text-[#0F172A]">Decisão e impacto</h3>
          </div>
          <Badge variant="outline" className="border-[#EDE9FE] bg-[#F5F3FF] text-[#5B21B6]">
            #{request.timeRecordId}
          </Badge>
        </div>
      </div>

      <CardContent className="space-y-4 px-5 py-5">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0B1220] text-sm font-semibold text-white"
          >
            {getInitials(request.partnerName)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#0F172A]" title={request.partnerName}>
              {request.partnerName}
            </p>
            {request.managerUsername ? (
              <p className="flex items-center gap-1 truncate text-xs text-[#64748B]">
                <UserCog className="h-3 w-3 text-[#5B21B6]" />
                Solicitado por {request.managerUsername}
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-[#F8FAFC] px-3 py-2.5 text-xs text-[#475569]">
          <p className="font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">Período</p>
          <p className="mt-1 capitalize text-[#0F172A]">
            {formatDateLong(request.currentStartWork)}
          </p>
        </div>

        <div className="space-y-2">
          <div className="rounded-2xl border border-border/60 bg-white p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
              Marcação atual
            </p>
            <div className="mt-1 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-[10px] text-[#94A3B8]">Início</p>
                <p className="font-mono text-[#0F172A]">{formatDateTime(request.currentStartWork)}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#94A3B8]">Fim</p>
                <p
                  className={cn(
                    "font-mono",
                    pendingClosure ? "text-[#B91C1C]" : "text-[#0F172A]"
                  )}
                >
                  {pendingClosure ? "Sem saída" : formatDateTime(request.currentEndWork)}
                </p>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-[#64748B]">
              <ClockIcon className="mr-1 inline h-3 w-3 text-[#475569]" />
              Total atual: <span className="font-semibold text-[#0F172A]">{currentDiff}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[#94A3B8]">
            <span className="h-px flex-1 bg-border/60" />
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
            Proposta de ajuste
            <span className="h-px flex-1 bg-border/60" />
          </div>

          <div className="rounded-2xl border border-[#FCD34D]/60 bg-[#FEF3C7] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#92400E]">
              Marcação proposta
            </p>
            <div className="mt-1 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-[10px] text-[#92400E]/70">Início</p>
                <p className="font-mono text-[#92400E]">{formatDateTime(request.newStartWork)}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#92400E]/70">Fim</p>
                <p className="font-mono text-[#92400E]">{formatDateTime(request.newEndWork)}</p>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-[#92400E]">
              <CalendarCheck className="mr-1 inline h-3 w-3" />
              Total proposto: <span className="font-semibold">{newDiff}</span>
            </p>
          </div>
        </div>

        {pendingClosure ? (
          <div className="flex items-start gap-2 rounded-xl border border-[#FECACA] bg-[#FEE2E2] px-3 py-2.5 text-[11px] leading-5 text-[#B91C1C]">
            <AlertOctagon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              A marcação atual está com <strong>saída pendente</strong>. Confirme a proposta antes
              de aprovar.
            </span>
          </div>
        ) : null}

        <div className="flex items-start gap-2 rounded-xl border border-[#DDD6FE] bg-[#F5F3FF] px-3 py-2.5 text-[11px] leading-5 text-[#5B21B6]">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Aprovar substitui a marcação no ponto e altera o saldo de horas. Rejeitar mantém a
            marcação original.
          </span>
        </div>

        {variant === "desktop" ? (
          <div className="flex flex-col gap-2 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => onReject(request.timeRecordId)}
              disabled={isMutating}
              className="h-11 gap-1 border-[#FECACA] bg-white text-[#B91C1C] hover:bg-[#FEE2E2]"
            >
              {isMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
              Rejeitar ajuste
            </Button>
            <Button
              type="button"
              onClick={() => onApprove(request.timeRecordId)}
              disabled={isMutating}
              className="h-11 gap-1 bg-[#16A34A] text-white hover:bg-[#15803D]"
            >
              {isMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Aprovar ajuste
            </Button>
          </div>
        ) : (
          <div className="flex items-start gap-2 rounded-xl border border-border/60 bg-[#F8FAFC] px-3 py-2 text-[11px] leading-5 text-[#475569]">
            <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#F59E0B]" />
            <span>Use as ações fixas no rodapé para aprovar ou rejeitar esta solicitação.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApprovalDecisionPanel;
