import { CalendarRange, ClipboardList, Sun } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getInitials } from "../utils/vacationApprovalFormatters";
import type { VacationApprovalViewModel } from "../types";
import VacationApprovalStatusBadge from "./VacationApprovalStatusBadge";

interface VacationApprovalCardProps {
  request: VacationApprovalViewModel;
  variant: "desktop" | "mobile";
  selected: boolean;
  onSelect: (request: VacationApprovalViewModel) => void;
}

const VacationApprovalCard = ({
  request,
  variant,
  selected,
  onSelect,
}: VacationApprovalCardProps) => {
  const handleClick = () => onSelect(request);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={selected}
      className={cn(
        "group flex w-full flex-col gap-3 rounded-2xl border bg-white px-4 py-3 text-left shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2",
        selected
          ? "border-[#2563EB] ring-1 ring-[#2563EB]"
          : "border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-md",
        variant === "mobile" && "px-4 py-4"
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-sm font-semibold text-[#1D4ED8]"
        >
          {getInitials(request.employeeName)}
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p
              className="truncate text-sm font-semibold text-[#0F172A]"
              title={request.employeeName}
            >
              {request.employeeName}
            </p>
            <VacationApprovalStatusBadge
              status={request.raw.status}
              label={request.statusLabel}
            />
          </div>
          <p className="text-xs text-[#64748B]">{request.recordsCount} registro(s) afetado(s)</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[11px] text-[#475569]">
        <div>
          <p className="font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">Início</p>
          <p className="mt-0.5 text-[#0F172A]">{request.startDateLabel}</p>
        </div>
        <div>
          <p className="font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">Fim</p>
          <p className="mt-0.5 text-[#0F172A]">{request.endDateLabel}</p>
        </div>
        <div>
          <p className="font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">Dias</p>
          <p className="mt-0.5 font-semibold text-[#1D4ED8]">{request.totalDays}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <Badge variant="outline" className="border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]">
          <CalendarRange className="mr-1 h-3 w-3" />
          {request.totalDays} dia(s)
        </Badge>
        {request.weekendDays > 0 ? (
          <Badge variant="outline" className="border-[#FCD34D] bg-[#FEF3C7] text-[#92400E]">
            <Sun className="mr-1 h-3 w-3" />
            {request.weekendDays} em fim de semana
          </Badge>
        ) : null}
        <Badge variant="outline" className="border-[#DDD6FE] bg-[#F5F3FF] text-[#5B21B6]">
          <ClipboardList className="mr-1 h-3 w-3" />
          {request.recordsCount} registro(s)
        </Badge>
      </div>
    </button>
  );
};

export default VacationApprovalCard;
