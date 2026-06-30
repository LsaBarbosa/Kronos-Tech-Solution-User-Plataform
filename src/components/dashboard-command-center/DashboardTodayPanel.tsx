import { AlertTriangle, ArrowRight, Clock3, Fingerprint, RefreshCcw, ShieldCheck, TimerReset } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useTodayTimeRecordStatus } from "@/hooks/useTodayTimeRecordStatus";
import { useCheckin } from "@/hooks/useCheckin";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
  formatTodayHeadlineDate,
  formatTodayRecordedAt,
  getTodayActionTypeLabel,
  getTodayLastRecordTypeLabel,
  getTodayNextActionLabel,
  getTodayPendingCount,
  getTodayPrimaryActionDescriptor,
  getTodayRecordSourceLabel,
  getTodaySecondaryActionLabel,
  getTodaySequenceSummary,
  getTodaySourceLabel,
  getTodayStatusLabel,
  getTodayStatusTone,
  getTodayTimezoneLabel,
  getTodayWorkedTimeLabel,
} from "@/utils/today-time-record";

interface DashboardTodayPanelProps {
  variant: "desktop" | "mobile";
  onOpenMirror: () => void;
  onOpenReport: () => void;
}

const TodayLoadingState = ({ variant }: { variant: "desktop" | "mobile" }) => (
  <Card className="overflow-hidden border-border/70 shadow-sm" data-testid="today-loading">
    <div className="bg-[linear-gradient(135deg,#0B1220_0%,#101A33_52%,#2563EB_100%)] px-5 py-5 text-white">
      <Skeleton className="h-4 w-28 bg-white/20" />
      <Skeleton className="mt-4 h-8 w-56 bg-white/20" />
      <Skeleton className="mt-3 h-10 w-full max-w-md bg-white/20" />
    </div>
    <CardContent className={cn("space-y-4 px-5 py-5", variant === "desktop" ? "lg:space-y-5" : "")}>
      <Skeleton className="h-32 w-full" />
      <div className={cn("grid gap-3", variant === "desktop" ? "sm:grid-cols-3" : "grid-cols-1")}>
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
      <Skeleton className="h-28 w-full" />
    </CardContent>
  </Card>
);

const SummaryStat = ({
  label,
  value,
  description,
  toneClassName,
}: {
  label: string;
  value: string;
  description: string;
  toneClassName: string;
}) => (
  <div className="min-w-0 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white px-4 py-4 shadow-sm">
    <p className="break-words text-[11px] font-semibold uppercase tracking-[0.22em] text-[#94A3B8]">
      {label}
    </p>
    <p className={cn("mt-2 break-words text-xl font-semibold leading-tight sm:text-2xl", toneClassName)}>
      {value}
    </p>
    {description ? (
      <p className="mt-1 break-words text-xs leading-5 text-[#64748B]">{description}</p>
    ) : null}
  </div>
);

const TimelineItem = ({
  actionType,
  recordedAt,
  status,
  source,
}: {
  actionType: string;
  recordedAt: string;
  status: string;
  source: string;
}) => {
  const statusTone = getTodayStatusTone(status);

  return (
    <div className="flex min-w-0 items-start justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-sm">
      <div className="flex min-w-0 items-start gap-3">
        <span
          aria-hidden="true"
          className={cn("mt-2 flex h-3 w-3 shrink-0 rounded-full", statusTone.dotClassName)}
        />
        <div className="min-w-0">
          <p className="text-base font-semibold text-[#0F172A]">{formatTodayRecordedAt(recordedAt)}</p>
          <p className="text-sm font-medium text-[#1E293B]">{getTodayActionTypeLabel(actionType)}</p>
          <p className="text-xs text-[#64748B]">{getTodayRecordSourceLabel({ id: 0, actionType, recordedAt, status, source })}</p>
        </div>
      </div>
      <span
        className={cn(
          "inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold",
          statusTone.badgeClassName
        )}
      >
        {getTodayStatusLabel(status)}
      </span>
    </div>
  );
};

const TodayErrorState = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <Card className="overflow-hidden border-border/70 shadow-sm" data-testid="today-error">
    <div className="bg-[linear-gradient(135deg,#0B1220_0%,#101A33_52%,#2563EB_100%)] px-5 py-5 text-white">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">Ponto hoje</p>
      <h2 className="mt-3 text-2xl font-semibold">Falha ao carregar o painel operacional</h2>
    </div>
    <CardContent className="px-5 py-5">
      <Alert className="border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Endpoint indisponivel</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
      <Button type="button" variant="outline" className="mt-4 gap-2" onClick={onRetry}>
        <RefreshCcw className="h-4 w-4" />
        Tentar novamente
      </Button>
    </CardContent>
  </Card>
);

const DashboardTodayPanel = ({
  variant,
  onOpenMirror,
  onOpenReport,
}: DashboardTodayPanelProps) => {
  const { todayStatus, isLoadingToday, todayError, refreshToday } = useTodayTimeRecordStatus();
  const { openCheckin } = useCheckin();
  const { user } = useAuth();
  const isTerminal = user?.profile?.terminalFlag ?? false;

  if (isLoadingToday && !todayStatus) {
    return <TodayLoadingState variant={variant} />;
  }

  if (!todayStatus) {
    return <TodayErrorState message={todayError || "Falha ao consultar /records/me/today."} onRetry={() => void refreshToday()} />;
  }

  const statusTone = getTodayStatusTone(todayStatus.status);
  const sequenceSummary = getTodaySequenceSummary(todayStatus);
  const pendingCount = getTodayPendingCount(todayStatus);
  const primaryAction = getTodayPrimaryActionDescriptor(todayStatus);
  const primaryActionLabel = primaryAction.label;
  const secondaryActionLabel = getTodaySecondaryActionLabel(todayStatus);
  const secondaryAction =
    secondaryActionLabel === "Abrir relatorio" ? onOpenReport : onOpenMirror;

  const timelineContent = todayStatus.records.length ? (
    <div className="space-y-3">
      {todayStatus.records.map((record, index) => (
        <TimelineItem
          key={`${record.id}-${record.actionType}-${record.recordedAt}-${index}`}
          actionType={record.actionType}
          recordedAt={record.recordedAt}
          status={record.status}
          source={record.source}
        />
      ))}
    </div>
  ) : (
    <div
      className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-6 text-sm text-[#475569]"
      data-testid="today-empty"
    >
      Nenhuma marcacao registrada ate agora.
    </div>
  );

  if (variant === "mobile") {
    return (
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,#0B1220_0%,#15254A_38%,#2D56D7_100%)] px-5 py-5 text-white">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/8" />
          <div className="relative">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="mt-6 text-3xl font-semibold leading-tight">{primaryActionLabel}</h2>
                <p className="mt-1 text-sm text-white/80">{formatTodayHeadlineDate(todayStatus.date)}</p>
                <div className="mt-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2563EB] text-lg font-black">
                    K
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">
                      Ponto hoje
                    </p>
                  </div>
                </div>
              </div>
              <Badge className={cn("border-white/20 bg-white/10 text-white", statusTone.textClassName)}>
                {getTodayStatusLabel(todayStatus.status)}
              </Badge>
            </div>
          </div>
        </div>

        <CardContent className="space-y-4 bg-[#F8FAFC] px-4 py-4">
          {todayError ? (
            <Alert className="border-[#FCD34D] bg-[#FFFBEB] text-[#B45309]">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Atualizacao parcial</AlertTitle>
              <AlertDescription>{todayError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="rounded-[28px] border border-[#D8E3F5] bg-white p-4 shadow-[0_16px_32px_-26px_rgba(37,99,235,0.55)]">
            <div className="flex items-start gap-4">
              <span
                aria-hidden="true"
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB]"
              >
                <Clock3 className="h-7 w-7" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-[#64748B]">Status atual</p>
                <p className={cn("break-words text-3xl font-semibold", statusTone.textClassName)}>
                  {getTodayStatusLabel(todayStatus.status)}
                </p>
                <p className="mt-2 text-sm text-[#475569]">
                  Ultimo registro: {todayStatus.lastRecordAt ? formatTodayRecordedAt(todayStatus.lastRecordAt) : "Nenhum"}
                  {" · "}
                  {todayStatus.lastRecordType ? getTodayLastRecordTypeLabel(todayStatus.lastRecordType) : "Sem tipo"}
                </p>
              </div>
            </div>

            {!isTerminal && (
              <Button
                type="button"
                className="mt-4 h-11 w-full gap-2 rounded-full bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                onClick={openCheckin}
                disabled={!primaryAction.enabled}
              >
                <Fingerprint className="h-4 w-4" />
                {primaryActionLabel}
              </Button>
            )}
          </div>

          <section className="rounded-[28px] border border-[#E2E8F0] bg-white px-4 py-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-2xl font-semibold text-[#0F172A]">Marcacoes de hoje</h3>
              <Badge className={cn("border", statusTone.badgeClassName)}>{todayStatus.records.length}</Badge>
            </div>
            <div className="mt-4">{timelineContent}</div>
          </section>

          <section className="rounded-[28px] border border-[#E2E8F0] bg-white px-4 py-5 shadow-sm">
            <h3 className="text-2xl font-semibold text-[#0F172A]">Resumo rapido</h3>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <SummaryStat
                label="Horas"
                value={getTodayWorkedTimeLabel(todayStatus)}
                description="trabalhadas"
                toneClassName="text-[#2563EB]"
              />
              <SummaryStat
                label="Sequencia"
                value={sequenceSummary.label}
                description={sequenceSummary.description}
                toneClassName={sequenceSummary.tone.textClassName}
              />
              <SummaryStat
                label="Pendencias"
                value={String(pendingCount)}
                description="para revisar"
                toneClassName={pendingCount > 0 ? "text-[#D97706]" : "text-[#15803D]"}
              />
            </div>
          </section>

          <section className="rounded-[28px] border border-[#E2E8F0] bg-white px-4 py-5 shadow-sm">
            <h3 className="text-xl font-semibold text-[#0F172A]">Origem e confianca</h3>
            <p className="mt-2 text-sm text-[#475569]">
              source: {getTodaySourceLabel(todayStatus.source)}
            </p>
          </section>

          <section className="rounded-[28px] border border-[#E2E8F0] bg-white px-4 py-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">Acao principal</p>
            <p className="mt-2 text-sm text-[#475569]">
              A proxima acao considera o status do dia e a sequencia atual das marcacoes.
            </p>
            <div className={cn("mt-4 grid gap-3", isTerminal ? "grid-cols-1" : "grid-cols-2")}>
              <Button type="button" variant="outline" className="rounded-full" onClick={secondaryAction}>
                {secondaryActionLabel}
              </Button>
              {!isTerminal && (
                <Button
                  type="button"
                  className="rounded-full bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                  onClick={openCheckin}
                  disabled={!primaryAction.enabled}
                >
                  {primaryActionLabel}
                </Button>
              )}
            </div>
          </section>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border/70 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.55)]">
      <div className="relative overflow-hidden bg-[linear-gradient(135deg,#0B1220_0%,#15254A_42%,#2563EB_100%)] px-6 py-6 text-white">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.24),transparent_52%)]" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-4">
            <div>
              <h2 className="text-3xl font-semibold xl:text-4xl">{primaryActionLabel}</h2>
              <p className="mt-2 text-sm text-white/80">
                {formatTodayHeadlineDate(todayStatus.date)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-white/15 bg-white/10 text-white">Ponto hoje</Badge>
              <Badge className={cn("border-white/15 bg-white/10", statusTone.textClassName)}>
                {getTodayStatusLabel(todayStatus.status)}
              </Badge>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:w-[460px]">
            <div className="rounded-3xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-white/65">Ultimo registro</p>
              <p className="mt-2 text-2xl font-semibold">
                {todayStatus.lastRecordAt ? formatTodayRecordedAt(todayStatus.lastRecordAt) : "Nenhum"}
              </p>
              <p className="mt-1 text-sm text-white/75">
                {todayStatus.lastRecordType ? getTodayLastRecordTypeLabel(todayStatus.lastRecordType) : "Sem tipo"}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-white/65">Proxima acao</p>
              <p className="mt-2 text-2xl font-semibold">{getTodayNextActionLabel(todayStatus.nextAction)}</p>
              <p className="mt-1 text-sm text-white/75">{sequenceSummary.description}</p>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="space-y-6 bg-[#F8FAFC] px-6 py-6">
        {todayError ? (
          <Alert className="border-[#FCD34D] bg-[#FFFBEB] text-[#B45309]">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Atualizacao parcial</AlertTitle>
            <AlertDescription>{todayError}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <section className="rounded-[28px] border border-[#D8E3F5] bg-white p-5 shadow-[0_18px_42px_-30px_rgba(37,99,235,0.55)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", statusTone.surfaceClassName)}
                  >
                    <ShieldCheck className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-sm text-[#64748B]">Status atual</p>
                    <p className={cn("text-3xl font-semibold", statusTone.textClassName)}>
                      {getTodayStatusLabel(todayStatus.status)}
                    </p>
                  </div>
                </div>
                <p className="max-w-2xl text-sm leading-6 text-[#475569]">
                  Ultimo registro em {todayStatus.lastRecordAt ? formatTodayRecordedAt(todayStatus.lastRecordAt) : "nenhum horario"}
                  {" · "}
                  {todayStatus.lastRecordType ? getTodayLastRecordTypeLabel(todayStatus.lastRecordType) : "sem tipo disponivel"}.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                {!isTerminal && (
                  <Button
                    type="button"
                    onClick={openCheckin}
                    disabled={!primaryAction.enabled}
                    className="h-11 gap-2 bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                  >
                    <Fingerprint className="h-4 w-4" />
                    {primaryActionLabel}
                  </Button>
                )}
                <Button type="button" variant="outline" className="h-11 gap-2" onClick={secondaryAction}>
                  <TimerReset className="h-4 w-4" />
                  {secondaryActionLabel}
                </Button>
              </div>
            </div>

            <Separator className="my-5" />

            <div>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold text-[#0F172A]">Linha do tempo do dia</h3>
                <Badge className={cn("border", statusTone.badgeClassName)}>{todayStatus.records.length} eventos</Badge>
              </div>
              {timelineContent}
            </div>
          </section>

          <section className="space-y-4">
            <SummaryStat
              label="Horas"
              value={getTodayWorkedTimeLabel(todayStatus)}
              description="calculadas pelas marcacoes completas de hoje"
              toneClassName="text-[#2563EB]"
            />
            <SummaryStat
              label="Sequencia"
              value={sequenceSummary.label}
              description={sequenceSummary.description}
              toneClassName={sequenceSummary.tone.textClassName}
            />
            <SummaryStat
              label="Pendencias"
              value={String(pendingCount)}
              description="itens que ainda exigem revisao operacional"
              toneClassName={pendingCount > 0 ? "text-[#D97706]" : "text-[#15803D]"}
            />
            <div className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#94A3B8]">
                Origem e timezone
              </p>
              <p className="mt-2 text-base font-semibold text-[#0F172A]">{getTodaySourceLabel(todayStatus.source)}</p>
              <p className="mt-1 text-sm text-[#64748B]">{getTodayTimezoneLabel(todayStatus.timezone)}</p>
              <Button type="button" variant="ghost" className="mt-3 h-auto px-0 text-[#2563EB]" onClick={() => void refreshToday()}>
                Atualizar painel
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardTodayPanel;
