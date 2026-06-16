import type { LgpdRequestType } from "@/service/lgpd.service";
import { cn } from "@/lib/utils";
import { getTypeLabel, getTypeTone } from "../utils/lgpd-formatters";

interface LgpdTypeBadgeProps {
  type: LgpdRequestType | string | null | undefined;
  className?: string;
  display?: "label" | "code";
}

export const LgpdTypeBadge = ({ type, className, display = "code" }: LgpdTypeBadgeProps) => {
  const tone = getTypeTone(type);
  const text = display === "label" ? getTypeLabel(type) : type ?? "—";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em]",
        tone.badge,
        className
      )}
      title={getTypeLabel(type)}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
      {text}
    </span>
  );
};

export default LgpdTypeBadge;
