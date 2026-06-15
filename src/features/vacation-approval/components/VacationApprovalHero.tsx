import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Crown } from "lucide-react";
import type { VacationApprovalMetric } from "../types";
import { VacationApprovalMetrics } from "./VacationApprovalMetrics";

interface VacationApprovalHeroProps {
  variant: "desktop" | "mobile";
  title: string;
  subtitle: string;
  label: string;
  metrics?: VacationApprovalMetric[];
  className?: string;
}

export const VacationApprovalHero = ({
  variant,
  title,
  subtitle,
  label,
  metrics = [],
  className,
}: VacationApprovalHeroProps) => {
  if (variant === "mobile") {
    return (
      <Card
        className={cn(
          "overflow-hidden border-0 bg-[linear-gradient(135deg,#0B1220_0%,#101A33_52%,#1E3A8A_100%)] text-white shadow-xl",
          className
        )}
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#2563EB] shadow-sm">
                <Crown className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold leading-tight">{title}</p>
                <p className="text-sm text-white/70">{subtitle}</p>
              </div>
            </div>
            <Badge variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/15">{label}</Badge>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "overflow-hidden border-0 bg-[linear-gradient(90deg,#0B1220_0%,#101A33_46%,#1E3A8A_100%)] text-white shadow-2xl",
        className
      )}
    >
      <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:p-8">
        <div className="space-y-4">
          <Badge variant="outline" className="w-fit border-white/20 bg-white/10 px-4 py-1 text-sm font-semibold text-white hover:bg-white/15">
            {label}
          </Badge>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              {title}
            </h1>
            <p className="max-w-3xl text-base leading-relaxed text-white/75">
              {subtitle}
            </p>
          </div>
        </div>
        <div className="lg:pt-3">
          <VacationApprovalMetrics metrics={metrics} variant="desktop" />
        </div>
      </div>
    </Card>
  );
};
