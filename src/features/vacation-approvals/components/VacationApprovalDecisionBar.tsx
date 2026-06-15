import { ThumbsUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInitials } from "../utils/vacationApprovalFormatters";
import type { VacationApprovalViewModel, VacationDecisionAction } from "../types";

interface VacationApprovalDecisionBarProps {
  request: VacationApprovalViewModel | null;
  isBusy: boolean;
  onDecision: (action: VacationDecisionAction, request: VacationApprovalViewModel) => void;
}

const VacationApprovalDecisionBar = ({
  request,
  isBusy,
  onDecision,
}: VacationApprovalDecisionBarProps) => {
  if (!request) return null;

  const disabled = isBusy || !request.isPending;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-sm font-semibold text-[#1D4ED8]"
        >
          {getInitials(request.employeeName)}
        </span>
        <div className="min-w-0 flex-1 text-[11px] leading-4 text-[#475569]">
          <p className="truncate text-sm font-semibold text-[#0F172A]" title={request.employeeName}>
            {request.employeeName}
          </p>
          <p className="truncate">
            {request.periodLabel} · {request.totalDays} dia(s)
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="Rejeitar"
            disabled={disabled}
            onClick={() => onDecision("reject", request)}
            className="h-11 gap-1 border-[#FECACA] bg-white text-[#B91C1C] hover:bg-[#FEE2E2]"
          >
            <X className="h-4 w-4" />
            Rejeitar
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={disabled}
            onClick={() => onDecision("approve", request)}
            className="h-11 gap-1 bg-[#16A34A] text-white hover:bg-[#15803D]"
          >
            <ThumbsUp className="h-4 w-4" />
            Aprovar férias
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VacationApprovalDecisionBar;
