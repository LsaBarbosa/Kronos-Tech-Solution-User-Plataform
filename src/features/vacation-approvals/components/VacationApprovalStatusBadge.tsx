import { cn } from "@/lib/utils";
import { getVacationStatusTone } from "../utils/vacationApprovalFormatters";

interface VacationApprovalStatusBadgeProps {
  status: string;
  label: string;
  className?: string;
}

const VacationApprovalStatusBadge = ({
  status,
  label,
  className,
}: VacationApprovalStatusBadgeProps) => {
  const tone = getVacationStatusTone(status);
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

export default VacationApprovalStatusBadge;
