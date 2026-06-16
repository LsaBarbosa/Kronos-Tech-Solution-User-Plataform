import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSlaTone } from "../utils/lgpd-formatters";

interface LgpdSlaBadgeProps {
  createdAt: string | null | undefined;
  isOverdue: boolean;
  className?: string;
}

export const LgpdSlaBadge = ({ createdAt, isOverdue, className }: LgpdSlaBadgeProps) => {
  const tone = getSlaTone(createdAt, isOverdue);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em]",
        tone.badge,
        className
      )}
    >
      {tone.isOverdue ? <AlertTriangle className="h-3 w-3" /> : null}
      {tone.label}
    </span>
  );
};

export default LgpdSlaBadge;
