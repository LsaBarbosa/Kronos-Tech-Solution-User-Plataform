import { CheckCircle2, FileText, TriangleAlert, XCircle, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TimeOffApprovalMetricsProps {
  variant: "desktop" | "mobile" | "hero";
  pending: number;
  approved: number;
  rejected: number;
  withEvidence: number;
}

interface MetricCard {
  icon: LucideIcon;
  label: string;
  hint: string;
  value: number;
  toneText: string;
  toneBg: string;
}

const buildMetrics = (
  pending: number,
  approved: number,
  rejected: number,
  withEvidence: number
): MetricCard[] => [
  {
    icon: TriangleAlert,
    label: "Pendentes",
    hint: "aguardando decisão",
    value: pending,
    toneText: "text-[#B45309]",
    toneBg: "bg-[#FEF3C7]",
  },
  {
    icon: CheckCircle2,
    label: "Aprovados",
    hint: "decisão positiva",
    value: approved,
    toneText: "text-[#15803D]",
    toneBg: "bg-[#DCFCE7]",
  },
  {
    icon: XCircle,
    label: "Rejeitados",
    hint: "decisão negativa",
    value: rejected,
    toneText: "text-[#B91C1C]",
    toneBg: "bg-[#FEE2E2]",
  },
  {
    icon: FileText,
    label: "Com anexo",
    hint: "evidência disponível",
    value: withEvidence,
    toneText: "text-[#1D4ED8]",
    toneBg: "bg-[#EFF6FF]",
  },
];

const HeroStat = ({ label, value, hint }: { label: string; value: number; hint: string }) => (
  <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur">
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">{label}</p>
    <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    <p className="text-[11px] text-white/65">{hint}</p>
  </div>
);

const TimeOffApprovalMetrics = ({
  variant,
  pending,
  approved,
  rejected,
  withEvidence,
}: TimeOffApprovalMetricsProps) => {
  const metrics = buildMetrics(pending, approved, rejected, withEvidence);

  if (variant === "hero") {
    return (
      <div className="grid w-full grid-cols-2 gap-2 xl:grid-cols-4">
        {metrics.map(({ label, value, hint }) => (
          <HeroStat key={label} label={label} value={value} hint={hint} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-3",
        variant === "mobile" ? "grid-cols-2" : "grid-cols-2 sm:gap-4 lg:grid-cols-4"
      )}
    >
      {metrics.map(({ icon: Icon, label, value, hint, toneBg, toneText }) => (
        <Card key={label} className="border-border/70 shadow-sm">
          <CardContent className="flex items-start gap-3 px-4 py-4">
            <span
              aria-hidden="true"
              className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", toneBg, toneText)}
            >
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
                {label}
              </p>
              <p className={cn("text-base font-semibold sm:text-lg", toneText)}>{value}</p>
              <p className="mt-0.5 line-clamp-1 text-[11px] text-[#64748B]">{hint}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TimeOffApprovalMetrics;
