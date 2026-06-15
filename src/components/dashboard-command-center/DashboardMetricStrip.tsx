import type { KeyboardEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Building,
  Clock as ClockIcon,
  MessageSquareWarning,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { DashboardCommandCenterData } from "./dashboard-command-center.types";

interface DashboardMetricStripProps {
  variant: "desktop" | "mobile";
  data: DashboardCommandCenterData;
  onJornadaClick?: () => void;
  onPendingClick?: () => void;
  onWarningClick?: () => void;
  onProfileClick?: () => void;
}

interface MetricItem {
  icon: LucideIcon;
  label: string;
  value: string;
  description: string;
  tone: string;
  bgIcon: string;
  textValue: string;
  onClick?: () => void;
  ariaLabel?: string;
  loading?: boolean;
}

const handleKeyDown = (callback?: () => void) =>
  (event: KeyboardEvent<HTMLDivElement>) => {
    if (!callback) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      callback();
    }
  };

const DashboardMetricStrip = ({
  variant,
  data,
  onJornadaClick,
  onPendingClick,
  onWarningClick,
  onProfileClick,
}: DashboardMetricStripProps) => {
  const pendingValue = data.hasApprovalPermission ? String(data.totalPendingCount) : "Acesso";
  const pendingDesc = data.hasApprovalPermission
    ? "Ponto, férias e abonos"
    : "Documentos, férias e abonos";
  const pendingTone =
    !data.hasApprovalPermission
      ? { bg: "bg-[#EFF6FF]", text: "text-[#1D4ED8]", accent: "from-[#2563EB] to-[#1D4ED8]" }
      : data.totalPendingCount > 0
        ? { bg: "bg-[#FEE2E2]", text: "text-[#B91C1C]", accent: "from-[#DC2626] to-[#F97316]" }
        : { bg: "bg-[#DCFCE7]", text: "text-[#15803D]", accent: "from-[#16A34A] to-[#22D3EE]" };

  const warningTone =
    data.newWarnings.length > 0
      ? { bg: "bg-[#FEF3C7]", text: "text-[#92400E]", accent: "from-[#F59E0B] to-[#FB923C]" }
      : { bg: "bg-[#EFF6FF]", text: "text-[#1D4ED8]", accent: "from-[#2563EB] to-[#22D3EE]" };

  const metrics: MetricItem[] = [
    {
      icon: ClockIcon,
      label: "Jornada",
      value: "Online",
      description: "Relógio e relatório de ponto",
      tone: "from-[#1E3A8A] to-[#2563EB]",
      bgIcon: "bg-[#EFF6FF]",
      textValue: "text-[#1D4ED8]",
      onClick: onJornadaClick,
      ariaLabel: "Abrir relatório de ponto",
    },
    {
      icon: data.hasApprovalPermission ? AlertTriangle : Zap,
      label: data.hasApprovalPermission ? "Pendências" : "Acesso rápido",
      value: data.countsAreLoading ? "..." : pendingValue,
      description: pendingDesc,
      tone: pendingTone.accent,
      bgIcon: pendingTone.bg,
      textValue: pendingTone.text,
      onClick: onPendingClick,
      ariaLabel: data.hasApprovalPermission
        ? "Abrir apuração de horas"
        : "Abrir acesso rápido",
      loading: data.countsAreLoading,
    },
    {
      icon: MessageSquareWarning,
      label: "Avisos",
      value: String(data.newWarnings.length),
      description:
        data.newWarnings.length > 0 ? "Novas mensagens internas" : "Nenhuma mensagem nova",
      tone: warningTone.accent,
      bgIcon: warningTone.bg,
      textValue: warningTone.text,
      onClick: data.newWarnings.length > 0 ? onWarningClick : undefined,
      ariaLabel: data.newWarnings.length > 0 ? "Abrir avisos recentes" : undefined,
    },
    {
      icon: Building,
      label: "Perfil",
      value: data.roleLabel || "Colaborador",
      description: data.userData?.companyName || "Empresa não informada",
      tone: "from-[#7C3AED] to-[#A855F7]",
      bgIcon: "bg-[#EDE9FE]",
      textValue: "text-[#5B21B6]",
      onClick: onProfileClick,
      ariaLabel: "Abrir detalhes do colaborador",
    },
  ];

  const visibleMetrics = variant === "mobile" ? metrics.slice(0, 3) : metrics;

  return (
    <div
      className={cn(
        "grid gap-3",
        variant === "mobile" ? "grid-cols-3" : "grid-cols-2 sm:gap-4 xl:grid-cols-4"
      )}
    >
      {visibleMetrics.map(({ icon: Icon, label, value, description, tone, bgIcon, textValue, onClick, ariaLabel }) => {
        const interactive = Boolean(onClick);
        return (
          <Card
            key={label}
            className={cn(
              "relative overflow-hidden border-border/70 shadow-sm",
              interactive &&
                "cursor-pointer transition hover:border-[#2563EB] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
            )}
            role={interactive ? "button" : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={ariaLabel}
            onClick={onClick}
            onKeyDown={interactive ? handleKeyDown(onClick) : undefined}
          >
            <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", tone)} />
            <CardContent
              className={cn(
                "flex items-start gap-3 px-4 py-4",
                variant === "mobile" && "flex-col items-start gap-2 px-3 py-3"
              )}
            >
              <span
                aria-hidden="true"
                className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", bgIcon, textValue)}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
                  {label}
                </p>
                <p className={cn("truncate text-base font-semibold sm:text-lg", textValue)}>
                  {value}
                </p>
                {variant === "desktop" ? (
                  <p className="mt-0.5 line-clamp-2 text-xs text-[#64748B]">{description}</p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardMetricStrip;
