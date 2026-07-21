import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Home, ShieldCheck, UserCheck, UserX, Users, BriefcaseBusiness, Fingerprint } from "lucide-react";
import type { CollaboratorSummary } from "../types/collaborator-view.types";
import { collaboratorTokens } from "../styles/collaborator.tokens";

type CollaboratorHeroProps = {
  variant: "desktop" | "mobile";
  summary: CollaboratorSummary;
  hasActiveFilters: boolean;
  onCreateCollaborator: () => void;
  onClearFilters: () => void;
  onGoHome?: () => void;
};

const MetricCard = ({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  tone: "primary" | "success" | "warning" | "danger" | "neutral";
}) => {
  const toneClass = {
    primary: "bg-white/12 border-white/20 text-white",
    success: "bg-emerald-500/14 border-emerald-300/25 text-white",
    warning: "bg-amber-500/14 border-amber-300/25 text-white",
    danger: "bg-rose-500/14 border-rose-300/25 text-white",
    neutral: "bg-white/10 border-white/20 text-white",
  }[tone];

  return (
    <div className={cn("rounded-[20px] border px-3 py-3 shadow-[0_12px_24px_rgba(0,0,0,0.08)]", toneClass)}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div className="min-w-0">
          <div className="text-xl font-semibold leading-none xl:text-2xl">{value}</div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/75 xl:text-xs xl:tracking-[0.18em]">{label}</div>
        </div>
      </div>
    </div>
  );
};

export const CollaboratorHero = ({
  variant,
  summary,
  hasActiveFilters,
  onCreateCollaborator,
  onClearFilters,
  onGoHome,
}: CollaboratorHeroProps) => {
  if (variant === "mobile") {
    return (
      <div
        className="relative overflow-hidden rounded-b-[28px] px-4 pt-4 pb-5 text-white"
        style={{ background: collaboratorTokens.gradients.hero }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{ background: collaboratorTokens.gradients.heroAccent }}
        />
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">Central de pessoas</Badge>
            <h1 className="text-2xl font-semibold leading-tight">Central de pessoas</h1>
            <p className="max-w-[26rem] text-sm text-white/80">
              Status, escala, conta e ações em uma única visão.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-2">
            {onGoHome && (
              <Button
                type="button"
                variant="outline"
                onClick={onGoHome}
                className="h-10 rounded-full border-white/20 bg-white/8 px-4 text-white hover:bg-white/15 hover:text-white"
              >
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            )}
            <Button
              type="button"
              onClick={onCreateCollaborator}
              className="h-10 rounded-full bg-white px-4 text-[#101A33] hover:bg-white/90"
            >
              Novo colaborador
            </Button>
          </div>
        </div>

        <div className="relative z-10 mt-4 grid grid-cols-2 gap-3">
          <MetricCard icon={<Users className="h-4 w-4 text-cyan-200" />} label="Ativos" value={summary.active} tone="primary" />
          <MetricCard icon={<UserX className="h-4 w-4 text-rose-200" />} label="Inativos" value={summary.inactive} tone="danger" />
          <MetricCard icon={<UserCheck className="h-4 w-4 text-emerald-200" />} label="Gestores" value={summary.managers} tone="success" />
          <MetricCard icon={<BriefcaseBusiness className="h-4 w-4 text-indigo-200" />} label="Home office" value={summary.homeOffice} tone="neutral" />
          <div className="col-span-2 rounded-[22px] border border-white/20 bg-white/10 px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-cyan-200" />
              <div className="min-w-0">
                <div className="text-sm font-medium">Biometria pendente</div>
                <div className="text-xs text-white/75">
                  {summary.biometricPending} colaboradores aguardando cadastro ou vínculo operacional.
                </div>
              </div>
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="relative z-10 mt-4 flex items-center justify-between rounded-[20px] border border-white/15 bg-white/8 px-4 py-3 text-sm text-white/85">
            <span>Filtros aplicados. Use limpar para voltar ao quadro completo.</span>
            <Button
              type="button"
              variant="ghost"
              onClick={onClearFilters}
              className="h-9 rounded-full px-4 text-white hover:bg-white/12 hover:text-white"
            >
              Limpar
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-[28px] px-6 py-6 text-white shadow-[0_18px_48px_rgba(11,18,32,0.18)] lg:px-8 lg:py-8"
      style={{ background: collaboratorTokens.gradients.hero }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{ background: collaboratorTokens.gradients.heroAccent }}
      />
      <div className="relative z-10 flex flex-col gap-6 xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,460px)] xl:items-end">
        <div className="min-w-0 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">Central de pessoas</Badge>
            {hasActiveFilters && (
              <Badge className="border-cyan-300/30 bg-cyan-400/15 text-white hover:bg-cyan-400/15">
                Filtros ativos
              </Badge>
            )}
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold leading-tight lg:text-5xl">
              Colaboradores
            </h1>
            <p className="max-w-2xl text-base text-white/82 lg:text-lg">
              Acompanhe status, escala, vínculo de usuário, contato e ações sensíveis com rastreabilidade gerencial.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {onGoHome && (
              <Button
                type="button"
                variant="outline"
                onClick={onGoHome}
                className="h-11 rounded-full border-white/20 bg-white/8 px-5 text-white hover:bg-white/14 hover:text-white"
              >
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            )}
            <Button
              type="button"
              onClick={onCreateCollaborator}
              className="h-11 rounded-full bg-white px-5 text-[#101A33] hover:bg-white/90"
            >
              Novo colaborador
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClearFilters}
              className="h-11 rounded-full border-white/20 bg-white/8 px-5 text-white hover:bg-white/14 hover:text-white"
            >
              Limpar filtros
            </Button>
          </div>
        </div>

        <div className="min-w-0 grid gap-3 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
          <MetricCard icon={<Users className="h-4 w-4 text-cyan-200" />} label="Ativos" value={summary.active} tone="primary" />
          <MetricCard icon={<UserX className="h-4 w-4 text-rose-200" />} label="Inativos" value={summary.inactive} tone="danger" />
          <MetricCard icon={<UserCheck className="h-4 w-4 text-emerald-200" />} label="Gestores" value={summary.managers} tone="success" />
          <MetricCard icon={<BriefcaseBusiness className="h-4 w-4 text-indigo-200" />} label="Home office" value={summary.homeOffice} tone="neutral" />
          <div className="rounded-[20px] border border-white/20 bg-white/10 px-3 py-3 sm:col-span-2 xl:col-span-1">
            <div className="flex items-start gap-3">
              <Fingerprint className="mt-1 h-4 w-4 text-cyan-200" />
              <div>
                <div className="text-xl font-semibold leading-none xl:text-2xl">{summary.biometricPending}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/75 xl:text-xs xl:tracking-[0.18em]">Biometria pendente</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
