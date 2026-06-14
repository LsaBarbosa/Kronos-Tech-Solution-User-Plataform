import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { VacationPeriodSummary } from "../types";

type VacationSummaryTone = "success" | "warning" | "info" | "error";

const toneClasses: Record<VacationSummaryTone, string> = {
  success: "border-[#B7E4C7] bg-[#DCFCE7] text-[#166534]",
  warning: "border-[#F3D08A] bg-[#FEF3C7] text-[#9A3412]",
  info: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1E3A8A]",
  error: "border-[#F5B5B5] bg-[#FEE2E2] text-[#B91C1C]",
};

interface VacationDateRangeSummaryProps {
  summary: VacationPeriodSummary;
  managerLabel?: string;
  startLabel?: string;
  endLabel?: string;
  statusLabel: string;
  statusTone: VacationSummaryTone;
  helperMessage?: string;
  className?: string;
}

const SummaryMetric = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="rounded-[20px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">{label}</p>
    <p className="mt-2 text-2xl font-semibold tracking-tight text-[#0F172A]">{value}</p>
  </div>
);

const VacationDateRangeSummary = ({
  summary,
  managerLabel,
  startLabel,
  endLabel,
  statusLabel,
  statusTone,
  helperMessage,
  className,
}: VacationDateRangeSummaryProps) => {
  return (
    <div className={cn("rounded-[28px] border border-[#E2E8F0] bg-white p-5 shadow-[0_16px_40px_rgba(16,26,51,0.08)]", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[#0F172A]">Período solicitado</p>
          <p className="text-sm leading-6 text-[#64748B]">{summary.periodLabel}</p>
        </div>
        <Badge variant="outline" className={cn("font-semibold", toneClasses[statusTone])}>
          {statusLabel}
        </Badge>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <SummaryMetric label="Início" value={startLabel ?? summary.startLabel} />
        <SummaryMetric label="Fim" value={endLabel ?? summary.endLabel} />
        <SummaryMetric label="Dias corridos" value={String(summary.dayCount)} />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <SummaryMetric label="Dias úteis estimados" value={String(summary.businessDays)} />
        <SummaryMetric label="Finais de semana" value={String(summary.weekendCount)} />
      </div>

      {managerLabel ? (
        <div className="mt-4 rounded-[22px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">
            Manager
          </p>
          <p className="mt-1 text-sm font-semibold text-[#0F172A]">{managerLabel}</p>
        </div>
      ) : null}

      {helperMessage ? (
        <div className={cn("mt-4 rounded-[22px] border p-4 text-sm leading-6", toneClasses[statusTone])}>
          {helperMessage}
        </div>
      ) : null}
    </div>
  );
};

export default VacationDateRangeSummary;

