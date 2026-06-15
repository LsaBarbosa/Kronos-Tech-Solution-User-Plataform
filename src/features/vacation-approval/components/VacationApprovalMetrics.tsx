import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { VacationApprovalMetric } from "../types";
import { VACATION_APPROVAL_STATUS_ACCENTS } from "../utils/vacation-approval-formatters";

interface VacationApprovalMetricsProps {
  metrics: VacationApprovalMetric[];
  variant: "desktop" | "mobile";
  className?: string;
}

export const VacationApprovalMetrics = ({ metrics, variant, className }: VacationApprovalMetricsProps) => {
  const visibleMetrics = variant === "mobile" ? metrics.slice(0, 3) : metrics;

  return (
    <div
      className={cn(
        variant === "desktop" ? "grid gap-3 lg:grid-cols-2 2xl:grid-cols-4" : "grid grid-cols-2 gap-3 sm:grid-cols-3",
        className
      )}
    >
      {visibleMetrics.map((metric) => (
        <Card
          key={metric.label}
          className={cn(
            "relative overflow-hidden border shadow-none",
            variant === "desktop"
              ? "border-white/15 bg-white/10 text-white backdrop-blur-sm"
              : "border-border bg-background text-foreground"
          )}
        >
          <div className={cn("absolute inset-y-0 left-0 w-1.5", VACATION_APPROVAL_STATUS_ACCENTS[metric.tone as keyof typeof VACATION_APPROVAL_STATUS_ACCENTS] ?? "bg-slate-400")} />
          <div className={cn("p-4", variant === "mobile" && "p-3")}>
            <p className={cn("font-semibold tracking-tight", variant === "desktop" ? "text-2xl" : "text-xl", metric.value >= 100 && "text-[1.5rem]")}>
              {metric.value}
            </p>
            <p className={cn("text-sm font-medium", variant === "desktop" ? "text-white/75" : "text-muted-foreground")}>
              {metric.label}
            </p>
            {variant === "desktop" && (
              <p className="mt-1 text-xs leading-relaxed text-white/65">{metric.description}</p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
