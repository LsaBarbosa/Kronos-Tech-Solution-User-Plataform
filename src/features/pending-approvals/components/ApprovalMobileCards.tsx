import { ArrowRight, CalendarCheck, Clock as ClockIcon, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TimeRecordApprovalResponse } from "@/types/recordApproval";
import {
  computeHoursDiff,
  formatDateTime,
  getInitials,
  isPendingClosure,
} from "../utils/approval-formatters";

interface ApprovalMobileCardsProps {
  approvals: TimeRecordApprovalResponse[];
  selectedKey: number | null;
  onSelect: (request: TimeRecordApprovalResponse) => void;
}

const ApprovalMobileCards = ({ approvals, selectedKey, onSelect }: ApprovalMobileCardsProps) => {
  return (
    <div className="space-y-3">
      {approvals.map((approval) => {
        const isSelected = approval.timeRecordId === selectedKey;
        const pendingClosure = isPendingClosure(approval);
        const newDiff = computeHoursDiff(approval.newStartWork, approval.newEndWork);

        return (
          <Card
            key={approval.timeRecordId}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            onClick={() => onSelect(approval)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(approval);
              }
            }}
            className={cn(
              "overflow-hidden border shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2",
              isSelected
                ? "border-[#2563EB] ring-1 ring-[#2563EB]"
                : "border-[#E2E8F0] hover:border-[#2563EB]"
            )}
          >
            <div className="space-y-3 px-4 py-4">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0B1220] text-xs font-semibold text-white"
                >
                  {getInitials(approval.partnerName)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-[#0F172A]" title={approval.partnerName}>
                      {approval.partnerName}
                    </p>
                    <Badge variant="outline" className="border-[#EDE9FE] bg-[#F5F3FF] text-[10px] text-[#5B21B6]">
                      #{approval.timeRecordId}
                    </Badge>
                  </div>
                  {approval.managerUsername ? (
                    <p className="truncate text-xs text-[#64748B]">
                      Solicitado por {approval.managerUsername}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <div className="rounded-xl border border-border/60 bg-[#F8FAFC] px-3 py-2 text-xs">
                  <p className="font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">Atual</p>
                  <p className="mt-0.5 font-mono text-[#0F172A]">
                    {formatDateTime(approval.currentStartWork)} →{" "}
                    <span className={cn(pendingClosure && "text-[#B91C1C]")}>
                      {pendingClosure ? "Sem saída" : formatDateTime(approval.currentEndWork)}
                    </span>
                  </p>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className="h-3 w-3 text-[#94A3B8]" aria-hidden="true" />
                </div>
                <div className="rounded-xl border border-[#FCD34D]/60 bg-[#FEF3C7]/50 px-3 py-2 text-xs">
                  <p className="font-semibold uppercase tracking-[0.18em] text-[#92400E]">Proposto</p>
                  <p className="mt-0.5 font-mono text-[#0F172A]">
                    {formatDateTime(approval.newStartWork)} → {formatDateTime(approval.newEndWork)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {pendingClosure ? (
                  <Badge variant="outline" className="border-[#FECACA] bg-[#FEE2E2] text-[#B91C1C]">
                    <TriangleAlert className="mr-1 h-3 w-3" />
                    Saída pendente
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D]">
                    <CalendarCheck className="mr-1 h-3 w-3" />
                    Marcação fechada
                  </Badge>
                )}
                <Badge variant="outline" className="border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]">
                  <ClockIcon className="mr-1 h-3 w-3" />
                  Δ {newDiff}
                </Badge>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ApprovalMobileCards;
