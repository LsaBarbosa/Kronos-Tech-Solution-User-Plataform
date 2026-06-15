import {
  AlertTriangle,
  CalendarClock,
  Loader2,
  Save,
  ShieldCheck,
  ZapOff,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DetailedReportItem } from "@/utils/report-utils";
import {
  formatRecordDate,
  getInitials,
  getStatusTone,
  TARGET_STATUS_OPTIONS,
  type TargetStatus,
} from "./status-registro-helpers";

interface StatusDecisionPanelProps {
  variant: "desktop" | "mobile";
  record: DetailedReportItem | null;
  newStatus: TargetStatus | "";
  onNewStatusChange: (value: TargetStatus | "") => void;
  isSavingStatus: boolean;
  isTogglingActivate: boolean;
  onRequestSave: () => void;
  onRequestToggle: () => void;
}

const StatusDecisionPanel = ({
  variant,
  record,
  newStatus,
  onNewStatusChange,
  isSavingStatus,
  isTogglingActivate,
  onRequestSave,
  onRequestToggle,
}: StatusDecisionPanelProps) => {
  if (!record) {
    return (
      <Card className="border-border/70 shadow-sm">
        <CardContent className="flex flex-col items-center gap-3 px-5 py-10 text-center text-[#64748B]">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1F5F9] text-[#94A3B8]"
          >
            <ShieldCheck className="h-6 w-6" />
          </span>
          <p className="text-sm font-semibold text-[#0F172A]">Selecione um registro</p>
          <p className="max-w-md text-xs leading-5">
            Toque/click em um registro da lista para abrir o painel de decisão.
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentTone = getStatusTone(record.statusRecord);
  const hasMarcacao = Boolean(record.startHour || record.endHour);
  const busy = isSavingStatus || isTogglingActivate;
  const canSave = !busy && Boolean(newStatus) && Boolean(record.timeRecordId) && Boolean(record.employeeId);
  const canToggle = !busy && Boolean(record.timeRecordId) && Boolean(record.employeeId);

  return (
    <Card className="border-border/70 shadow-sm">
      <div className="border-b border-border/60 bg-[#F8FAFC] px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Registro selecionado
        </p>
        <h2 className="mt-1 text-lg font-semibold text-[#0F172A]">Decisão e impacto</h2>
      </div>

      <CardContent className="space-y-4 px-5 py-5">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EFF6FF] text-base font-semibold text-[#1D4ED8]"
          >
            {getInitials(record.employeeData?.employeeName ?? "?")}
          </span>
          <div className="min-w-0">
            <p
              className="truncate text-sm font-semibold text-[#0F172A]"
              title={record.employeeData?.employeeName ?? "—"}
            >
              {record.employeeData?.employeeName ?? "—"}
            </p>
            {record.employeeData?.companyName ? (
              <p className="truncate text-xs text-[#64748B]">{record.employeeData.companyName}</p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/60 bg-[#F8FAFC] px-3 py-2.5 text-[11px] text-[#475569]">
          <div>
            <p className="font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">Data</p>
            <p className="mt-0.5 flex items-center gap-1 text-[#0F172A]">
              <CalendarClock className="h-3.5 w-3.5 text-[#2563EB]" />
              {formatRecordDate(record.startWork)}
            </p>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">Status atual</p>
            <p className="mt-0.5">
              <Badge className={currentTone.badgeClass}>{currentTone.label}</Badge>
            </p>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">Entrada</p>
            <p className="mt-0.5 text-[#0F172A]">{record.startHour || "—"}</p>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">Saída</p>
            <p className="mt-0.5 text-[#0F172A]">{record.endHour || "—"}</p>
          </div>
        </div>

        {!hasMarcacao ? (
          <div className="flex items-start gap-2 rounded-xl border border-[#FCD34D] bg-[#FEF3C7] px-3 py-2.5 text-[11px] leading-5 text-[#92400E]">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>Sem marcação no dia. Verifique antes de aplicar mudança.</span>
          </div>
        ) : null}

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">
            Novo status
          </p>
          <div role="radiogroup" aria-label="Novo status" className="grid gap-2 sm:grid-cols-3">
            {TARGET_STATUS_OPTIONS.map((option) => {
              const isActive = newStatus === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  disabled={busy}
                  onClick={() => onNewStatusChange(isActive ? "" : option.value)}
                  className={cn(
                    "rounded-2xl border px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
                    isActive
                      ? "border-[#2563EB] bg-[#EFF6FF] ring-1 ring-[#2563EB]"
                      : "border-[#E2E8F0] bg-white hover:border-[#2563EB]"
                  )}
                >
                  <Badge className={option.tone.badgeClass}>{option.label}</Badge>
                  <p className="mt-1.5 text-[11px] leading-5 text-[#64748B]">{option.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-[#FECACA] bg-[#FEE2E2] px-3 py-2.5 text-[11px] leading-5 text-[#B91C1C]">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Alterações de status afetam jornada, banco de horas e indicadores. A operação é registrada
            para auditoria.
          </span>
        </div>

        <div
          className={cn(
            "flex flex-col gap-2 border-t border-border/60 pt-4",
            variant === "desktop" && "sm:flex-row sm:items-center sm:justify-between"
          )}
        >
          <Button
            type="button"
            variant="outline"
            onClick={onRequestToggle}
            disabled={!canToggle}
            className="h-11 gap-1 border-[#FECACA] bg-white text-[#B91C1C] hover:bg-[#FEE2E2]"
          >
            {isTogglingActivate ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ZapOff className="h-4 w-4" />
            )}
            {record.active === false ? "Ativar registro" : "Inativar registro"}
          </Button>
          <Button
            type="button"
            onClick={onRequestSave}
            disabled={!canSave}
            className="h-11 gap-1 bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
          >
            {isSavingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar status
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusDecisionPanel;
