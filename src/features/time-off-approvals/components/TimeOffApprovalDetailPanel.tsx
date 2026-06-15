import {
  CalendarRange,
  Clock,
  Download,
  FileText,
  ShieldCheck,
  ThumbsUp,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TimeOffApprovalViewModel, TimeOffDecisionAction } from "../types";
import { getInitials } from "../utils/timeOffApprovalFormatters";
import TimeOffApprovalStatusBadge from "./TimeOffApprovalStatusBadge";

interface TimeOffApprovalDetailPanelProps {
  variant: "desktop" | "mobile";
  request: TimeOffApprovalViewModel | null;
  onDecision: (action: TimeOffDecisionAction, request: TimeOffApprovalViewModel) => void;
  onDownload: (request: TimeOffApprovalViewModel) => void;
  isBusy: boolean;
}

const ImpactCard = ({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: string;
}) => (
  <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-[#F8FAFC] px-3 py-2.5">
    <span
      aria-hidden="true"
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-white",
        tone
      )}
    >
      {icon}
    </span>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
        {label}
      </p>
      <p className="truncate text-sm font-semibold text-[#0F172A]">{value}</p>
    </div>
  </div>
);

const TimeOffApprovalDetailPanel = ({
  variant,
  request,
  onDecision,
  onDownload,
  isBusy,
}: TimeOffApprovalDetailPanelProps) => {
  if (!request) {
    return (
      <Card className="border-border/70 shadow-sm">
        <CardContent className="flex flex-col items-center gap-3 px-5 py-12 text-center text-muted-foreground">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1F5F9] text-[#94A3B8]"
          >
            <ShieldCheck className="h-6 w-6" />
          </span>
          <p className="text-sm font-semibold text-[#0F172A]">Selecione uma solicitação</p>
          <p className="max-w-md text-xs leading-5 text-[#64748B]">
            Clique em um card da fila para visualizar o detalhe, a evidência e as ações de decisão.
          </p>
        </CardContent>
      </Card>
    );
  }

  const showActions = request.isPending;

  return (
    <Card className="border-border/70 shadow-sm">
      <div className="border-b border-border/60 bg-[#F8FAFC] px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Solicitação selecionada
            </p>
            <h3 className="text-lg font-semibold text-[#0F172A]">{request.kindLabel}</h3>
          </div>
          <TimeOffApprovalStatusBadge
            status={request.record.statusRecord}
            label={request.statusLabel}
          />
        </div>
      </div>

      <CardContent className="space-y-4 px-5 py-5">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EFF6FF] text-base font-semibold text-[#1D4ED8]"
          >
            {getInitials(request.employeeName)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#0F172A]" title={request.employeeName}>
              {request.employeeName}
            </p>
            {request.companyName ? (
              <p className="truncate text-xs text-[#64748B]">{request.companyName}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <ImpactCard
            label="Início"
            value={`${request.formattedStartDate} · ${request.startHour}`}
            icon={<CalendarRange className="h-4 w-4" />}
            tone="from-[#1E3A8A] to-[#2563EB]"
          />
          <ImpactCard
            label="Fim"
            value={`${request.formattedEndDate} · ${request.endHour}`}
            icon={<CalendarRange className="h-4 w-4" />}
            tone="from-[#0D9488] to-[#22D3EE]"
          />
          <ImpactCard
            label="Horas"
            value={request.hoursWork || "—"}
            icon={<Clock className="h-4 w-4" />}
            tone="from-[#7C3AED] to-[#2563EB]"
          />
        </div>

        {request.documentId ? (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#DDD6FE] bg-[#F5F3FF] px-4 py-3">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDE9FE] text-[#5B21B6]"
              >
                <FileText className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">Evidência anexada</p>
                <p className="text-xs text-[#5B21B6]">
                  Verifique antes de aprovar ou rejeitar a solicitação.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label={`Baixar evidência de ${request.employeeName}`}
              onClick={() => onDownload(request)}
              className="h-10 gap-1 border-[#DDD6FE] bg-white text-[#5B21B6] hover:bg-[#EDE9FE]"
            >
              <Download className="h-4 w-4" />
              Baixar
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#FECACA] bg-[#FEE2E2]/40 px-4 py-3 text-xs leading-5 text-[#B91C1C]">
            Esta solicitação foi enviada sem evidência anexada. Considere o impacto antes de aprovar.
          </div>
        )}

        <div className="rounded-2xl border border-border/60 bg-[#F8FAFC] px-4 py-3 text-xs leading-5 text-[#475569]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0F172A]">
            Regra de decisão
          </p>
          <p className="mt-1">
            Aprovar registra o abono no ponto e altera horas/saldo do colaborador. Rejeitar mantém o
            registro original sem aplicar abono.
          </p>
        </div>

        {showActions ? (
          <div
            className={cn(
              "flex flex-col gap-2 border-t border-border/60 pt-4",
              variant === "desktop" && "sm:flex-row sm:items-center sm:justify-end"
            )}
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => onDecision("reject", request)}
              disabled={isBusy}
              className="h-11 gap-1 border-[#FECACA] bg-white text-[#B91C1C] hover:bg-[#FEE2E2]"
            >
              <X className="h-4 w-4" />
              Rejeitar abono
            </Button>
            <Button
              type="button"
              onClick={() => onDecision("approve", request)}
              disabled={isBusy}
              className="h-11 gap-1 bg-[#16A34A] text-white hover:bg-[#15803D]"
            >
              <ThumbsUp className="h-4 w-4" />
              Aprovar abono
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/60 bg-[#F8FAFC] px-4 py-3 text-xs leading-5 text-[#475569]">
            Esta solicitação não está mais pendente. Use os filtros para visualizar outras.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeOffApprovalDetailPanel;
