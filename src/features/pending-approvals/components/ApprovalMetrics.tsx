import { AlertOctagon, ClipboardList, Users, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ApprovalMetricsProps {
  variant: "desktop" | "mobile";
  pendingTotal: number;
  uniqueEmployees: number;
  pendingClosure: number;
}

interface MetricCard {
  icon: LucideIcon;
  label: string;
  value: number;
  hint: string;
  toneText: string;
  toneBg: string;
  toneAccent: string;
}

const ApprovalMetrics = ({
  variant,
  pendingTotal,
  uniqueEmployees,
  pendingClosure,
}: ApprovalMetricsProps) => {
  const metrics: MetricCard[] = [
    {
      icon: ClipboardList,
      label: "Pendentes",
      value: pendingTotal,
      hint: "aguardando decisão",
      toneText: "text-[#B45309]",
      toneBg: "bg-[#FEF3C7]",
      toneAccent: "from-[#F59E0B] to-[#FB923C]",
    },
    {
      icon: Users,
      label: "Colaboradores",
      value: uniqueEmployees,
      hint: "envolvidos na fila",
      toneText: "text-[#1D4ED8]",
      toneBg: "bg-[#EFF6FF]",
      toneAccent: "from-[#1E3A8A] to-[#2563EB]",
    },
    {
      icon: AlertOctagon,
      label: "Sem saída",
      value: pendingClosure,
      hint: "fim atual em aberto",
      toneText: "text-[#B91C1C]",
      toneBg: "bg-[#FEE2E2]",
      toneAccent: "from-[#DC2626] to-[#F97316]",
    },
  ];

  return (
    <div
      className={cn(
        "grid gap-3",
        variant === "mobile" ? "grid-cols-3" : "grid-cols-1 sm:grid-cols-3 sm:gap-4"
      )}
    >
      {metrics.map(({ icon: Icon, label, value, hint, toneText, toneBg, toneAccent }) => (
        <Card key={label} className="relative overflow-hidden border-border/70 shadow-sm">
          <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", toneAccent)} />
          <CardContent
            className={cn(
              "flex items-start gap-3 px-4 py-4",
              variant === "mobile" && "flex-col items-start gap-1 px-3 py-3"
            )}
          >
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
              <p className={cn("text-lg font-semibold sm:text-xl", toneText)}>{value}</p>
              {variant === "desktop" ? (
                <p className="mt-0.5 text-[11px] text-[#64748B]">{hint}</p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ApprovalMetrics;
