import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusTone = "success" | "warning" | "destructive" | "pending" | "neutral" | "info";

interface StatusBadgeProps {
  label: string;
  description?: string;
  tone?: StatusTone;
  className?: string;
}

const toneClasses: Record<StatusTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  destructive: "border-red-200 bg-red-50 text-red-700",
  pending: "border-sky-200 bg-sky-50 text-sky-700",
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
  info: "border-violet-200 bg-violet-50 text-violet-700",
};

export const StatusBadge = ({
  label,
  description,
  tone = "neutral",
  className,
}: StatusBadgeProps) => (
  <Badge
    variant="outline"
    className={cn(
      "inline-flex min-w-0 max-w-full flex-wrap items-start gap-x-2 gap-y-1 rounded-full px-3 py-1.5 text-left text-[11px] font-semibold leading-4",
      toneClasses[tone],
      className
    )}
  >
    <span className="min-w-0 break-words">{label}</span>
    {description ? <span className="min-w-0 break-words font-normal opacity-80">{description}</span> : null}
  </Badge>
);
