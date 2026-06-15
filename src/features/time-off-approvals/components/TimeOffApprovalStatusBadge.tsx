import { cn } from "@/lib/utils";
import { getStatusTone } from "../utils/timeOffApprovalFormatters";
import type { RecordStatus } from "@/types/recordApproval";

interface TimeOffApprovalStatusBadgeProps {
  status: RecordStatus;
  label: string;
  className?: string;
}

const TimeOffApprovalStatusBadge = ({
  status,
  label,
  className,
}: TimeOffApprovalStatusBadgeProps) => {
  const tone = getStatusTone(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        tone.badgeClass,
        className
      )}
    >
      <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", tone.dotClass)} />
      {label}
    </span>
  );
};

export default TimeOffApprovalStatusBadge;
