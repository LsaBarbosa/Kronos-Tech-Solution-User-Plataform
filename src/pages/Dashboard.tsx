import { useCallback, useMemo, useState, type ComponentType, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import Clock from "@/components/Clock";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Building,
  CalendarDays,
  CheckCircle2,
  Clock as ClockIcon,
  DollarSign,
  Eye,
  EyeOff,
  FileCheck,
  ListChecks,
  Mail,
  MessageSquareWarning,
  Phone,
  Plane,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  TimerReset,
  TreePalm,
  User2,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { useDashboardData } from "@/hooks/useDashboardData";
import { useVacationCount } from "@/hooks/useVacationCount";
import { useTimeOffCount } from "@/hooks/useTimeOffCount";
import { CheckinDashboardCard } from "@/components/checkin/CheckinDashboardCard";
import PageShell from "@/components/PageShell";
import { APP_PATHS } from "@/config/app-routes";
import { getRoleDisplayName, type WarningMessage } from "@/types/dashboard";
import { cn } from "@/lib/utils";
import {
  formatPhone,
  formatSalary,
  getFirstName,
  getSecondName,
} from "@/utils/dashboard-utils";
import { getDashboardCardsLayoutByRole, type DashboardCardConfig } from "@/utils/dashboard-cards-config";
import {
  dashboardToneColors,
  priorityBadgeColors,
  dashboardCardStyles,
  sectionTextColors,
  skeletonColors,
  type DashboardTone,
} from "@/utils/dashboard-tone-colors";

interface DashboardIconProps {
  className?: string;
}

interface DashboardMetricCardProps {
  icon: ComponentType<DashboardIconProps>;
  title: string;
  value: string | number;
  description: string;
  tone: DashboardTone;
  onClick?: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  ariaLabel?: string;
  isLoading?: boolean;
}

interface DashboardSectionProps {
  title: string;
  description: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

const toneClasses = dashboardToneColors;
const dashboardCardClassName = dashboardCardStyles.base;
const interactiveCardClassName = cn(dashboardCardStyles.base, dashboardCardStyles.interactive);

const formatCurrentDate = () =>
  new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date());

const formatWarningDate = (value?: string) => {
  if (!value) return "Data indisponível";

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return "Data indisponível";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
};

const getWarningPriorityMeta = (priority?: string) => {
  const normalizedPriority = priority?.toUpperCase();

  if (normalizedPriority === "CRITICAL" || normalizedPriority === "HIGH") {
    return priorityBadgeColors.critical;
  }

  if (normalizedPriority === "ALERT" || normalizedPriority === "WARNING") {
    return priorityBadgeColors.alert;
  }

  return priorityBadgeColors.normal;
};

const DashboardSkeletonCard = ({ className }: { className?: string }) => {
  const skeletonBrand = dashboardToneColors.brand.skeleton!;
  return (
    <Card className={cn(dashboardCardClassName, "overflow-hidden", className)} aria-label="Carregando bloco da dashboard">
      <CardContent className="p-5">
        <div className="animate-pulse space-y-5">
          <div className="flex items-center gap-3">
            <div className={`h-11 w-11 rounded-xl ${skeletonBrand.background}`} />
            <div className="flex-1 space-y-2">
              <div className={`h-3 w-24 rounded-full ${skeletonColors.base}`} />
              <div className={`h-5 w-32 rounded-full ${skeletonBrand.line}`} />
            </div>
          </div>
          <div className={`h-16 rounded-xl ${skeletonColors.light}`} />
        </div>
      </CardContent>
    </Card>
  );
};

const DashboardEmptyState = ({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<DashboardIconProps>;
  title: string;
  description: string;
}) => (
  <div className={`rounded-lg border border-dashed ${dashboardToneColors.brand.emptyState?.border} ${dashboardToneColors.brand.emptyState?.background} p-5 text-center`}>
    <div className={`mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full ${dashboardToneColors.brand.emptyState?.icon}`}>
      <Icon className="h-5 w-5" aria-hidden="true" />
    </div>
    <p className={`text-sm font-semibold ${sectionTextColors.title}`}>{title}</p>
    <p className={`mt-1 text-sm ${sectionTextColors.description}`}>{description}</p>
  </div>
);

const DashboardErrorState = ({ title, description }: { title: string; description: string }) => {
  const errorColors = dashboardToneColors.danger.errorState!;
  return (
    <div className={`rounded-lg border ${errorColors.border} ${errorColors.background} p-5`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className={`mt-0.5 h-5 w-5 flex-shrink-0 ${errorColors.icon}`} aria-hidden="true" />
        <div>
          <p className={`text-sm font-semibold ${errorColors.title}`}>{title}</p>
          <p className={`mt-1 text-sm ${errorColors.description}`}>{description}</p>
        </div>
      </div>
    </div>
  );
};

const DashboardSection = ({ title, description, children, action, className }: DashboardSectionProps) => (
  <section className={cn("space-y-4", className)}>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className={`text-xl font-semibold ${sectionTextColors.title}`}>{title}</h2>
        <p className={`mt-1 text-sm ${sectionTextColors.description}`}>{description}</p>
      </div>
      {action}
    </div>
    {children}
  </section>
);

const DashboardCustomCard = ({
  card,
  onClick,
  onKeyDown,
}: {
  card: DashboardCardConfig;
  onClick: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}) => {
  const toneClass = toneClasses[card.tone];

  return (
    <Card
      className={cn(dashboardCardClassName, interactiveCardClassName, "overflow-hidden")}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role="button"
      tabIndex={0}
      aria-label={card.ariaLabel}
    >
      <CardContent className="relative p-5">
        <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", toneClass.accent)} />
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
            <p className={cn("mt-2 text-3xl font-bold text-foreground", toneClass.text)}>{card.value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>
          </div>
          <div className={cn("flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl", toneClass.icon)}>
            <card.icon className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const DashboardMetricCard = ({
  icon: Icon,
  title,
  value,
  description,
  tone,
  onClick,
  onKeyDown,
  ariaLabel,
  isLoading = false,
}: DashboardMetricCardProps) => {
  const toneClass = toneClasses[tone];

  return (
    <Card
      className={cn(dashboardCardClassName, "overflow-hidden", onClick && interactiveCardClassName)}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
    >
      <CardContent className="relative p-5">
        <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", toneClass.accent)} />
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {isLoading ? (
              <div className="mt-3 h-9 w-20 animate-pulse rounded-full bg-primary/10" />
            ) : (
              <p className={cn("mt-2 text-3xl font-bold text-foreground", toneClass.text)}>{value}</p>
            )}
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </div>
          <div className={cn("flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl", toneClass.icon)}>
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const DashboardActionButton = ({
  icon: Icon,
  label,
  description,
  onClick,
  tone = "brand",
}: {
  icon: ComponentType<DashboardIconProps>;
  label: string;
  description: string;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  tone?: DashboardTone;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-all duration-200 hover:border-primary/40 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
  >
    <span className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg", toneClasses[tone].icon)}>
      <Icon className="h-5 w-5" aria-hidden="true" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-semibold text-foreground">{label}</span>
      <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
    </span>
    <ArrowRight className="h-4 w-4 flex-shrink-0 text-primary transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
  </button>
);

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSalary, setShowSalary] = useState(false);

  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const toggleSalary = useCallback(() => setShowSalary((prev) => !prev), []);
  const getCardKeyDownHandler = useCallback(
    (action: () => void) => (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        action();
      }
    },
    []
  );

  const navigate = useNavigate();

  const {
    userData,
    isLoading,
    pendingApprovalsCount,
    newWarnings,
    hasApprovalPermission,
    handleWarningClick,
  } = useDashboardData();

  const { pendingVacationCount, isLoadingVacationCount } = useVacationCount(hasApprovalPermission);
  const { pendingTimeOffCount, isLoadingTimeOffCount } = useTimeOffCount(hasApprovalPermission);

  const handleApprovalClick = useCallback(() => {
    navigate(APP_PATHS.apuracaoHoras);
  }, [navigate]);

  const handleVacationApprovalClick = useCallback(() => {
    navigate(APP_PATHS.ferias);
  }, [navigate]);

  const handleTimeOffApprovalClick = useCallback(() => {
    navigate(APP_PATHS.aprovacoesAbono);
  }, [navigate]);

  const handleClockCardClick = useCallback(() => {
    navigate(APP_PATHS.relatorioDetalhado);
  }, [navigate]);

  const handleDetailsCardClick = useCallback(() => {
    navigate(APP_PATHS.usuario);
  }, [navigate]);

  const isCto = useMemo(() => userData?.role === "CTO", [userData?.role]);
  const isManager = useMemo(() => userData?.role === "MANAGER", [userData?.role]);

  const handleCompanyLinkClick = useCallback(
    (event: MouseEvent<HTMLSpanElement>) => {
      event.stopPropagation();
      if (isCto) {
        navigate(APP_PATHS.empresa);
      }
    },
    [isCto, navigate]
  );

  const handleCompanyButtonClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      if (isCto) {
        navigate(APP_PATHS.empresa);
      }
    },
    [isCto, navigate]
  );

  const handleAvisosCardClick = useCallback(() => {
    if (!isManager && newWarnings.length > 0) {
      void handleWarningClick();
    }
  }, [isManager, newWarnings.length, handleWarningClick]);

  const totalPendingCount = useMemo(
    () => pendingApprovalsCount + pendingVacationCount + pendingTimeOffCount,
    [pendingApprovalsCount, pendingVacationCount, pendingTimeOffCount]
  );

  const dashboardDate = useMemo(() => formatCurrentDate(), []);
  const firstName = getFirstName(userData?.fullName);
  const secondName = userData?.fullName ? getSecondName(userData.fullName) : "";
  const roleLabel = getRoleDisplayName(userData?.role || "");
  const countsAreLoading = Boolean(isLoadingVacationCount || isLoadingTimeOffCount);
  const profileUnavailable = !isLoading && !userData;
  const pendingTone: DashboardTone = !hasApprovalPermission
    ? "brand"
    : totalPendingCount > 0
      ? "danger"
      : "success";
  const pendingValue = hasApprovalPermission ? totalPendingCount : "Acesso";
  const warningTone: DashboardTone = newWarnings.length > 0 ? "warning" : "blue";

  const renderWarningList = (warnings: WarningMessage[]) => {
    if (warnings.length === 0) {
      return (
        <DashboardEmptyState
          icon={MessageSquareWarning}
          title="Nenhum aviso novo"
          description="Quando sua empresa publicar novos avisos, eles aparecerão aqui."
        />
      );
    }

    return (
      <div className="space-y-3">
        {warnings.slice(0, 4).map((warning) => {
          const priorityMeta = getWarningPriorityMeta(warning.priority);

          return (
            <button
              key={warning.messageId}
              type="button"
              onClick={() => void handleWarningClick()}
              className="w-full rounded-lg border border-border bg-card p-3 text-left transition-all duration-200 hover:border-primary/40 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="line-clamp-1 text-sm font-semibold text-foreground">{warning.title || "Aviso"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatWarningDate(warning.createdAt)}</p>
                </div>
                <span className={cn("inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-xs font-semibold", priorityMeta.className)}>
                  {priorityMeta.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <PageShell
      sidebarOpen={sidebarOpen}
      toggleSidebar={handleToggleSidebar}
      withBackground={false}
      mainClassName="pt-16 px-4 py-5 sm:px-6 sm:py-8 lg:px-8 relative z-10 bg-background"
    >
      <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">
        <section className="overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary via-blue-600 to-secondary p-5 text-primary-foreground shadow-lg sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-sm font-medium text-white shadow-sm backdrop-blur">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Dashboard Kronos
              </div>
              <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
                Bem-vindo ao Kronos
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-white/90 sm:text-lg">
                Gestão inteligente de jornada, colaboradores e conformidade trabalhista em um só lugar.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium text-white">
                  <User2 className="h-4 w-4" aria-hidden="true" />
                  Olá, {isLoading ? "..." : firstName}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium text-white capitalize">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  {dashboardDate}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium text-white">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  {isLoading ? "Carregando perfil" : profileUnavailable ? "Perfil indisponível" : "Operação ativa"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Button
                type="button"
                className="min-h-11 bg-white text-primary shadow-sm hover:bg-blue-50"
                onClick={handleClockCardClick}
              >
                Abrir relatório
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="outline"
                className="min-h-11 border-white/45 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                onClick={handleDetailsCardClick}
              >
                Meu perfil
              </Button>
            </div>
          </div>
        </section>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DashboardSkeletonCard />
            <DashboardSkeletonCard />
            <DashboardSkeletonCard />
            <DashboardSkeletonCard />
          </div>
        ) : (() => {
          const cardsLayout = getDashboardCardsLayoutByRole(userData?.role || "");
          const hasCustomCards = Object.values(cardsLayout).some(
            (card): card is DashboardCardConfig => card !== null && card !== "keep-default"
          );

          const isCustomCard = (card: unknown): card is DashboardCardConfig =>
            card !== null && card !== "keep-default" && typeof card === "object";

          return (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {hasCustomCards ? (
                <>
                  {cardsLayout.card1 === "keep-default" ? (
                    <DashboardMetricCard
                      icon={ClockIcon}
                      title="Jornada"
                      value="Online"
                      description="Relógio e relatório de ponto"
                      tone="blue"
                      onClick={handleClockCardClick}
                      onKeyDown={getCardKeyDownHandler(handleClockCardClick)}
                      ariaLabel="Abrir relatório de ponto"
                    />
                  ) : isCustomCard(cardsLayout.card1) ? (
                    <DashboardCustomCard
                      card={cardsLayout.card1}
                      onClick={() => navigate((cardsLayout.card1 as DashboardCardConfig).route)}
                      onKeyDown={getCardKeyDownHandler(() => navigate((cardsLayout.card1 as DashboardCardConfig).route))}
                    />
                  ) : null}

                  {cardsLayout.card2 === "keep-default" ? (
                    <DashboardMetricCard
                      icon={hasApprovalPermission ? AlertTriangle : Zap}
                      title={hasApprovalPermission ? "Pendências" : "Acesso rápido"}
                      value={pendingValue}
                      description={hasApprovalPermission ? "Ponto, férias e abonos" : "Documentos, férias e abonos"}
                      tone={pendingTone}
                      onClick={hasApprovalPermission ? handleApprovalClick : () => navigate(APP_PATHS.meusDocumentos)}
                      onKeyDown={getCardKeyDownHandler(hasApprovalPermission ? handleApprovalClick : () => navigate(APP_PATHS.meusDocumentos))}
                      ariaLabel={hasApprovalPermission ? "Abrir apuração de horas" : "Abrir resumo de acesso rápido"}
                      isLoading={countsAreLoading}
                    />
                  ) : isCustomCard(cardsLayout.card2) ? (
                    <DashboardCustomCard
                      card={cardsLayout.card2}
                      onClick={() => navigate((cardsLayout.card2 as DashboardCardConfig).route)}
                      onKeyDown={getCardKeyDownHandler(() => navigate((cardsLayout.card2 as DashboardCardConfig).route))}
                    />
                  ) : null}

                  {cardsLayout.card3 === "keep-default" ? (
                    <DashboardMetricCard
                      icon={MessageSquareWarning}
                      title="Avisos"
                      value={newWarnings.length}
                      description={newWarnings.length > 0 ? "Novas mensagens internas" : "Nenhuma mensagem nova"}
                      tone={warningTone}
                      onClick={!isManager && newWarnings.length > 0 ? handleAvisosCardClick : undefined}
                      onKeyDown={!isManager && newWarnings.length > 0 ? getCardKeyDownHandler(handleAvisosCardClick) : undefined}
                      ariaLabel={!isManager && newWarnings.length > 0 ? "Abrir avisos recentes" : undefined}
                    />
                  ) : isCustomCard(cardsLayout.card3) ? (
                    <DashboardCustomCard
                      card={cardsLayout.card3}
                      onClick={() => navigate((cardsLayout.card3 as DashboardCardConfig).route)}
                      onKeyDown={getCardKeyDownHandler(() => navigate((cardsLayout.card3 as DashboardCardConfig).route))}
                    />
                  ) : null}

                  {cardsLayout.card4 === "keep-default" ? (
                    <DashboardMetricCard
                      icon={Building}
                      title="Perfil"
                      value={roleLabel}
                      description={userData?.companyName || "Empresa não informada"}
                      tone="brand"
                      onClick={handleDetailsCardClick}
                      onKeyDown={getCardKeyDownHandler(handleDetailsCardClick)}
                      ariaLabel="Abrir detalhes do colaborador"
                    />
                  ) : isCustomCard(cardsLayout.card4) ? (
                    <DashboardCustomCard
                      card={cardsLayout.card4}
                      onClick={() => navigate((cardsLayout.card4 as DashboardCardConfig).route)}
                      onKeyDown={getCardKeyDownHandler(() => navigate((cardsLayout.card4 as DashboardCardConfig).route))}
                    />
                  ) : null}
                </>
              ) : (
                <>
                  <DashboardMetricCard
                    icon={ClockIcon}
                    title="Jornada"
                    value="Online"
                    description="Relógio e relatório de ponto"
                    tone="blue"
                    onClick={handleClockCardClick}
                    onKeyDown={getCardKeyDownHandler(handleClockCardClick)}
                    ariaLabel="Abrir relatório de ponto"
                  />
                  <DashboardMetricCard
                    icon={hasApprovalPermission ? AlertTriangle : Zap}
                    title={hasApprovalPermission ? "Pendências" : "Acesso rápido"}
                    value={pendingValue}
                    description={hasApprovalPermission ? "Ponto, férias e abonos" : "Documentos, férias e abonos"}
                    tone={pendingTone}
                    onClick={hasApprovalPermission ? handleApprovalClick : () => navigate(APP_PATHS.meusDocumentos)}
                    onKeyDown={getCardKeyDownHandler(hasApprovalPermission ? handleApprovalClick : () => navigate(APP_PATHS.meusDocumentos))}
                    ariaLabel={hasApprovalPermission ? "Abrir apuração de horas" : "Abrir resumo de acesso rápido"}
                    isLoading={countsAreLoading}
                  />
                  <DashboardMetricCard
                    icon={MessageSquareWarning}
                    title="Avisos"
                    value={newWarnings.length}
                    description={newWarnings.length > 0 ? "Novas mensagens internas" : "Nenhuma mensagem nova"}
                    tone={warningTone}
                    onClick={!isManager && newWarnings.length > 0 ? handleAvisosCardClick : undefined}
                    onKeyDown={!isManager && newWarnings.length > 0 ? getCardKeyDownHandler(handleAvisosCardClick) : undefined}
                    ariaLabel={!isManager && newWarnings.length > 0 ? "Abrir avisos recentes" : undefined}
                  />
                  <DashboardMetricCard
                    icon={Building}
                    title="Perfil"
                    value={roleLabel}
                    description={userData?.companyName || "Empresa não informada"}
                    tone="brand"
                    onClick={handleDetailsCardClick}
                    onKeyDown={getCardKeyDownHandler(handleDetailsCardClick)}
                    ariaLabel="Abrir detalhes do colaborador"
                  />
                </>
              )}
            </div>
          );
        })()}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card
            className={cn(dashboardCardClassName, interactiveCardClassName, "lg:col-span-2 overflow-hidden")}
            onClick={handleClockCardClick}
            onKeyDown={getCardKeyDownHandler(handleClockCardClick)}
            role="button"
            aria-label="Abrir relatório de ponto"
            tabIndex={0}
          >
            <CardContent className="p-0">
              <div className="border-b border-border bg-gradient-to-r from-blue-50 to-background p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <ClockIcon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Controle de Ponto Online</h2>
                      <p className="mt-1 text-sm text-muted-foreground">Acompanhe horário atual e acesse o relatório completo.</p>
                    </div>
                  </div>
                  <ArrowRight className="hidden h-5 w-5 text-primary sm:block" aria-hidden="true" />
                </div>
              </div>
              <div className="flex min-h-[190px] items-center justify-center p-6">
                <div className="rounded-2xl border border-border bg-card px-8 py-7 shadow-sm">
                  <Clock />
                  <p className="mt-4 text-center text-sm font-medium text-muted-foreground">Clique para acessar o Relatório Completo</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={cn(dashboardCardClassName, interactiveCardClassName)}
            onClick={handleDetailsCardClick}
            onKeyDown={getCardKeyDownHandler(handleDetailsCardClick)}
            role="button"
            aria-label="Abrir detalhes do colaborador"
            tabIndex={0}
          >
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-start gap-4 border-b border-border pb-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <User2 className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="line-clamp-1 text-xl font-semibold text-foreground">{firstName}</h2>
                  {secondName ? <p className="line-clamp-1 text-xl font-semibold text-foreground">{secondName}</p> : null}
                  <p className="mt-1 text-sm font-medium text-muted-foreground">
                    {userData?.jobPosition || "N/A"} <span className="font-normal">({roleLabel})</span>
                  </p>
                </div>
                {isCto && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="flex-shrink-0 text-primary hover:bg-primary/10 hover:text-primary"
                    onClick={handleCompanyButtonClick}
                    aria-label="Gerenciar Empresa"
                    title="Gerenciar Empresa"
                  >
                    <Briefcase className="mr-1 h-4 w-4" aria-hidden="true" />
                    Empresa
                  </Button>
                )}
              </div>

              <div className="mt-5 space-y-3">
                {profileUnavailable ? (
                  <DashboardErrorState
                    title="Não foi possível carregar este bloco."
                    description="Tente atualizar a página para buscar os dados do perfil novamente."
                  />
                ) : (
                  <>
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building className="h-4 w-4 text-primary" aria-hidden="true" />
                      <span
                        className={cn("font-medium text-foreground", isCto && "cursor-pointer underline decoration-primary/40 underline-offset-4 hover:text-primary")}
                        onClick={handleCompanyLinkClick}
                        title={isCto ? "Clique para ir para a Empresa" : undefined}
                      >
                        {userData?.companyName || "N/A"}
                      </span>
                    </p>
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
                      <span className="line-clamp-1 text-foreground">{userData?.email || "N/A"}</span>
                    </p>
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
                      <span className="text-foreground">{formatPhone(userData?.phone) || "N/A"}</span>
                    </p>
                    <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-sm text-muted-foreground">
                      <DollarSign className="h-5 w-5 flex-shrink-0 text-primary" aria-hidden="true" />
                      <span className="flex-1 text-lg font-bold text-primary">
                        {showSalary ? formatSalary(userData?.salary) : "R$ *****,**"}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary hover:bg-primary/10 hover:text-primary"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleSalary();
                        }}
                        aria-label={showSalary ? "Ocultar salário" : "Exibir salário"}
                        title={showSalary ? "Ocultar Salário" : "Exibir Salário"}
                      >
                        {showSalary ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <CheckinDashboardCard />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DashboardSection
            title="Avisos e mensagens"
            description="Comunicados internos recentes aparecem com prioridade e data."
            action={
              isManager ? (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
                    onClick={() => navigate(APP_PATHS.criarAviso)}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                    Criar Aviso
                  </Button>
                  <Button
                    type="button"
                    className="bg-primary text-primary-foreground hover:bg-secondary"
                    onClick={() => void handleWarningClick()}
                  >
                    Ver Todos Avisos
                  </Button>
                </div>
              ) : newWarnings.length > 0 ? (
                <Button
                  type="button"
                  className="bg-primary text-primary-foreground hover:bg-secondary"
                  onClick={() => void handleWarningClick()}
                >
                  Ver Avisos
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              ) : null
            }
          >
            <Card className={dashboardCardClassName}>
              <CardContent className="p-5">{renderWarningList(newWarnings)}</CardContent>
            </Card>
          </DashboardSection>

          {hasApprovalPermission ? (
            <DashboardSection
              title="Pendências operacionais"
              description="Priorize ajustes de ponto, férias e abonos em aberto."
            >
              <Card
                className={cn(dashboardCardClassName, interactiveCardClassName)}
                onClick={handleApprovalClick}
                onKeyDown={getCardKeyDownHandler(handleApprovalClick)}
                role="button"
                aria-label="Abrir apuração de horas"
                tabIndex={0}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total de Pendências</p>
                      <p className={cn("mt-2 text-4xl font-bold", totalPendingCount > 0 ? "text-red-600" : "text-success")}>
                        {countsAreLoading ? "..." : totalPendingCount}
                      </p>
                    </div>
                    <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", totalPendingCount > 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-success")}>
                      {totalPendingCount > 0 ? <AlertTriangle className="h-6 w-6" aria-hidden="true" /> : <CheckCircle2 className="h-6 w-6" aria-hidden="true" />}
                    </div>
                  </div>

                  <Separator className="my-4 bg-border" />

                  <div className="space-y-3">
                    <DashboardActionButton
                      icon={ListChecks}
                      label="Solicitação de ajuste no Ponto"
                      description={`${pendingApprovalsCount} pendente(s)`}
                      tone={pendingApprovalsCount > 0 ? "danger" : "brand"}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleApprovalClick();
                      }}
                    />
                    <DashboardActionButton
                      icon={Plane}
                      label="Solicitação de Férias"
                      description={`${pendingVacationCount} pendente(s)`}
                      tone={pendingVacationCount > 0 ? "danger" : "blue"}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleVacationApprovalClick();
                      }}
                    />
                    <DashboardActionButton
                      icon={Activity}
                      label="Solicitação de ajuste manual"
                      description={`${pendingTimeOffCount} pendente(s)`}
                      tone={pendingTimeOffCount > 0 ? "danger" : "cyan"}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleTimeOffApprovalClick();
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </DashboardSection>
          ) : (
            <DashboardSection
              title="Ações rápidas"
              description="Atalhos para as principais rotinas do colaborador."
            >
              <Card
                className={cn(dashboardCardClassName, interactiveCardClassName)}
                onClick={() => navigate(APP_PATHS.meusDocumentos)}
                onKeyDown={getCardKeyDownHandler(() => navigate(APP_PATHS.meusDocumentos))}
                role="button"
                aria-label="Abrir acesso rápido para meus documentos"
                tabIndex={0}
              >
                <CardContent className="p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Zap className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-foreground">Acesso Rápido</p>
                      <p className="text-sm text-muted-foreground">Documentos, férias e abonos.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <DashboardActionButton
                      icon={FileCheck}
                      label="Enviar Documentos"
                      description="Anexar documentos do colaborador"
                      tone="blue"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(APP_PATHS.enviarDocumentoColaborador);
                      }}
                    />
                    <DashboardActionButton
                      icon={TreePalm}
                      label="Solicitar Férias"
                      description="Abrir uma nova solicitação"
                      tone="success"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(APP_PATHS.solicitarFerias);
                      }}
                    />
                    <DashboardActionButton
                      icon={TimerReset}
                      label="Solicitar Abono de Horas"
                      description="Registrar pedido de ajuste manual"
                      tone="brand"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(APP_PATHS.solicitarAbono);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </DashboardSection>
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default Dashboard;
