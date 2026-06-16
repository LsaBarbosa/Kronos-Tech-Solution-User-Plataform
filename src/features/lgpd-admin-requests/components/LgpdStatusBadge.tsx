import type { LgpdRequestStatus } from "@/service/lgpd.service";
import { cn } from "@/lib/utils";
import { getStatusTone } from "../utils/lgpd-formatters";

interface LgpdStatusBadgeProps {
  status: LgpdRequestStatus | string | null | undefined;
  className?: string;
  showDot?: boolean;
}

export const LgpdStatusBadge = ({ status, className, showDot = true }: LgpdStatusBadgeProps) => {
  const tone = getStatusTone(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em]",
        tone.badge,
        className
      )}
    >
      {showDot ? <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} /> : null}
      {tone.label}
    </span>
  );
};

export default LgpdStatusBadge;
