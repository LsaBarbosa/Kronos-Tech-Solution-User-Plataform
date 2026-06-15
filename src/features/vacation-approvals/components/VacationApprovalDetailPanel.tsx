import {
  CalendarRange,
  ClipboardList,
  ShieldCheck,
  Sun,
  ThumbsUp,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatVacationDateLong, getInitials } from "../utils/vacationApprovalFormatters";
import type { VacationApprovalViewModel, VacationDecisionAction } from "../types";
import VacationApprovalStatusBadge from "./VacationApprovalStatusBadge";

interface VacationApprovalDetailPanelProps {
  variant: "desktop" | "mobile";
  request: VacationApprovalViewModel | null;
  onDecision: (action: VacationDecisionAction, request: VacationApprovalViewModel) => void;
  isBusy: boolean;
}

const ImpactCard = ({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
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

const VacationApprovalDetailPanel = ({
  variant,
  request,
  onDecision,
  isBusy,
}: VacationApprovalDetailPanelProps) => {
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
          <p className="text-sm font-semibold text-[#0F172A]">Selecione uma solicitação</p>
          <p className="max-w-md text-xs leading-5">
            Clique em um card da fila para visualizar o detalhe, o impacto e as ações de decisão.
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
            <h3 className="text-lg font-semibold text-[#0F172A]">Decisão e impacto</h3>
          </div>
          <VacationApprovalStatusBadge
            status={request.raw.status}
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
            <p className="truncate text-xs text-[#64748B]">ID {request.employeeId}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-[#F8FAFC] px-3 py-2.5 text-xs text-[#475569]">
          <p className="font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">Período</p>
          <p className="mt-1 capitalize text-[#0F172A]">
            {formatVacationDateLong(request.raw.startDate)}
          </p>
          <p className="text-[#475569]">→</p>
          <p className="capitalize text-[#0F172A]">
            {formatVacationDateLong(request.raw.endDate)}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <ImpactCard
            label="Dias"
            value={request.totalDays}
            icon={<CalendarRange className="h-4 w-4" />}
            tone="from-[#1E3A8A] to-[#2563EB]"
          />
          <ImpactCard
            label="Fins de semana"
            value={request.weekendDays}
            icon={<Sun className="h-4 w-4" />}
            tone="from-[#F59E0B] to-[#FB923C]"
          />
          <ImpactCard
            label="Registros"
            value={request.recordsCount}
            icon={<ClipboardList className="h-4 w-4" />}
            tone="from-[#7C3AED] to-[#A855F7]"
          />
        </div>

        <div className="rounded-2xl border border-border/60 bg-[#F8FAFC] px-4 py-3 text-xs leading-5 text-[#475569]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0F172A]">
            Regra de decisão
          </p>
          <p className="mt-1">
            Aprovar converte todos os {request.recordsCount} registro(s) para férias e atualiza o
            saldo do colaborador. Rejeitar mantém os registros como rejeitados sem alterar a jornada.
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
              Rejeitar lote
            </Button>
            <Button
              type="button"
              onClick={() => onDecision("approve", request)}
              disabled={isBusy}
              className="h-11 gap-1 bg-[#16A34A] text-white hover:bg-[#15803D]"
            >
              <ThumbsUp className="h-4 w-4" />
              Aprovar lote
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

export default VacationApprovalDetailPanel;
