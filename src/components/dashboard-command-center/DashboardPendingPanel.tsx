import type { MouseEvent } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileCheck,
  ListChecks,
  Plane,
  TimerReset,
  TreePalm,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { DashboardCommandCenterData } from "./dashboard-command-center.types";

interface DashboardPendingPanelProps {
  data: DashboardCommandCenterData;
  onApprovalClick: () => void;
  onVacationApprovalClick: () => void;
  onTimeOffApprovalClick: () => void;
  onMeusDocumentos: () => void;
  onEnviarDocumento: () => void;
  onSolicitarFerias: () => void;
  onSolicitarAbono: () => void;
}

const ActionRow = ({
  icon: Icon,
  label,
  description,
  toneClass,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  description: string;
  toneClass: string;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex w-full items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-3 py-3 text-left shadow-sm transition hover:border-[#2563EB] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
  >
    <span
      aria-hidden="true"
      className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", toneClass)}
    >
      <Icon className="h-5 w-5" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-semibold text-[#0F172A]">{label}</span>
      <span className="block text-xs text-[#64748B]">{description}</span>
    </span>
    <ArrowRight className="h-4 w-4 shrink-0 text-[#94A3B8] transition-transform group-hover:translate-x-0.5" />
  </button>
);

const DashboardPendingPanel = ({
  data,
  onApprovalClick,
  onVacationApprovalClick,
  onTimeOffApprovalClick,
  onMeusDocumentos,
  onEnviarDocumento,
  onSolicitarFerias,
  onSolicitarAbono,
}: DashboardPendingPanelProps) => {
  if (data.hasApprovalPermission) {
    const pendingTotal = data.totalPendingCount;
    const isPositive = pendingTotal === 0;
    return (
      <Card
        className="overflow-hidden border-border/70 shadow-sm transition hover:border-[#2563EB] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
        role="button"
        tabIndex={0}
        aria-label="Abrir apuração de horas"
        onClick={onApprovalClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onApprovalClick();
          }
        }}
      >
        <div className="border-b border-border/60 bg-[#F8FAFC] px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Pendências operacionais
          </p>
          <h2 className="mt-1 text-lg font-semibold text-[#0F172A]">
            Aprovações em aberto
          </h2>
        </div>
        <CardContent className="space-y-4 px-5 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">
                Total de pendências
              </p>
              <p
                className={cn(
                  "mt-2 text-4xl font-bold",
                  isPositive ? "text-[#15803D]" : "text-[#B91C1C]"
                )}
              >
                {data.countsAreLoading ? "..." : pendingTotal}
              </p>
            </div>
            <span
              aria-hidden="true"
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl",
                isPositive ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#FEE2E2] text-[#B91C1C]"
              )}
            >
              {isPositive ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
            </span>
          </div>

          <Separator />

          <div className="space-y-2">
            <ActionRow
              icon={ListChecks}
              label="Solicitação de ajuste de ponto"
              description={`${data.pendingApprovalsCount} pendente(s)`}
              toneClass={
                data.pendingApprovalsCount > 0
                  ? "bg-[#FEE2E2] text-[#B91C1C]"
                  : "bg-[#EFF6FF] text-[#1D4ED8]"
              }
              onClick={(event) => {
                event.stopPropagation();
                onApprovalClick();
              }}
            />
            <ActionRow
              icon={Plane}
              label="Solicitação de férias"
              description={`${data.pendingVacationCount} pendente(s)`}
              toneClass={
                data.pendingVacationCount > 0
                  ? "bg-[#FEE2E2] text-[#B91C1C]"
                  : "bg-[#EFF6FF] text-[#1D4ED8]"
              }
              onClick={(event) => {
                event.stopPropagation();
                onVacationApprovalClick();
              }}
            />
            <ActionRow
              icon={Activity}
              label="Solicitação de abono"
              description={`${data.pendingTimeOffCount} pendente(s)`}
              toneClass={
                data.pendingTimeOffCount > 0
                  ? "bg-[#FEE2E2] text-[#B91C1C]"
                  : "bg-[#CCFBF1] text-[#0F766E]"
              }
              onClick={(event) => {
                event.stopPropagation();
                onTimeOffApprovalClick();
              }}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="overflow-hidden border-border/70 shadow-sm transition hover:border-[#2563EB] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
      role="button"
      tabIndex={0}
      aria-label="Abrir acesso rápido para meus documentos"
      onClick={onMeusDocumentos}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onMeusDocumentos();
        }
      }}
    >
      <div className="border-b border-border/60 bg-[#F8FAFC] px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Ações rápidas
        </p>
        <h2 className="mt-1 text-lg font-semibold text-[#0F172A]">
          Atalhos do colaborador
        </h2>
      </div>
      <CardContent className="space-y-4 px-5 py-5">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EDE9FE] text-[#5B21B6]"
          >
            <Zap className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-[#0F172A]">Acesso rápido</p>
            <p className="text-xs text-[#64748B]">Documentos, férias e abonos.</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <ActionRow
            icon={FileCheck}
            label="Enviar documentos"
            description="Anexar documentos pessoais"
            toneClass="bg-[#EFF6FF] text-[#1D4ED8]"
            onClick={(event) => {
              event.stopPropagation();
              onEnviarDocumento();
            }}
          />
          <ActionRow
            icon={TreePalm}
            label="Solicitar férias"
            description="Abrir uma nova solicitação"
            toneClass="bg-[#DCFCE7] text-[#15803D]"
            onClick={(event) => {
              event.stopPropagation();
              onSolicitarFerias();
            }}
          />
          <ActionRow
            icon={TimerReset}
            label="Solicitar abono de horas"
            description="Registrar pedido de ajuste manual"
            toneClass="bg-[#EDE9FE] text-[#5B21B6]"
            onClick={(event) => {
              event.stopPropagation();
              onSolicitarAbono();
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardPendingPanel;
