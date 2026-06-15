import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardMobileActionCardProps {
  icon: LucideIcon;
  label: string;
  title: string;
  description: string;
  badge?: string;
  toneClass: string;
  textClass: string;
  onClick: () => void;
}

const DashboardMobileActionCard = ({
  icon: Icon,
  label,
  title,
  description,
  badge,
  toneClass,
  textClass,
  onClick,
}: DashboardMobileActionCardProps) => {
  return (
    <Card
      className="overflow-hidden border-border/70 shadow-sm transition active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
      role="button"
      tabIndex={0}
      aria-label={title}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <CardContent className="flex items-center gap-3 px-4 py-3">
        <span
          aria-hidden="true"
          className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", toneClass, textClass)}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#94A3B8]">
            {label}
          </p>
          <p className="truncate text-sm font-semibold text-[#0F172A]">{title}</p>
          <p className="line-clamp-1 text-xs text-[#64748B]">{description}</p>
        </div>
        {badge ? (
          <span className="inline-flex shrink-0 items-center rounded-full border border-[#FECACA] bg-[#FEE2E2] px-2 py-0.5 text-[11px] font-semibold text-[#B91C1C]">
            {badge}
          </span>
        ) : (
          <ArrowRight className="h-4 w-4 shrink-0 text-[#94A3B8]" />
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardMobileActionCard;
