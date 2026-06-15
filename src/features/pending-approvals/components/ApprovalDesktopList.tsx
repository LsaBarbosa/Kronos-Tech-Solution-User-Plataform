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

interface ApprovalDesktopListProps {
  approvals: TimeRecordApprovalResponse[];
  selectedKey: number | null;
  onSelect: (request: TimeRecordApprovalResponse) => void;
}

const ApprovalDesktopList = ({ approvals, selectedKey, onSelect }: ApprovalDesktopListProps) => {
  return (
    <Card className="overflow-hidden border-border/70 shadow-sm">
      <div className="border-b border-border/60 bg-[#F8FAFC] px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Fila de solicitações
        </p>
        <h2 className="mt-1 text-lg font-semibold text-[#0F172A]">Selecione um registro</h2>
      </div>
      <div className="divide-y divide-border/60">
        {approvals.map((approval) => {
          const isSelected = approval.timeRecordId === selectedKey;
          const pendingClosure = isPendingClosure(approval);
          const currentDiff = computeHoursDiff(approval.currentStartWork, approval.currentEndWork);
          const newDiff = computeHoursDiff(approval.newStartWork, approval.newEndWork);

          return (
            <button
              key={approval.timeRecordId}
              type="button"
              onClick={() => onSelect(approval)}
              aria-pressed={isSelected}
              className={cn(
                "flex w-full flex-col gap-3 px-5 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-inset",
                isSelected
                  ? "bg-[#EFF6FF] ring-1 ring-inset ring-[#2563EB]"
                  : "bg-white hover:bg-[#F8FAFC]"
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0B1220] text-xs font-semibold text-white"
                >
                  {getInitials(approval.partnerName)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className="truncate text-sm font-semibold text-[#0F172A]"
                      title={approval.partnerName}
                    >
                      {approval.partnerName}
                    </p>
                    <Badge variant="outline" className="border-[#EDE9FE] bg-[#F5F3FF] text-[10px] text-[#5B21B6]">
                      #{approval.timeRecordId}
                    </Badge>
                  </div>
                  {approval.managerUsername ? (
                    <p className="truncate text-xs text-[#64748B]">
                      Solicitado por <span className="font-medium text-[#475569]">{approval.managerUsername}</span>
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl border border-border/60 bg-[#F8FAFC] px-3 py-2.5 text-xs">
                <div>
                  <p className="font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">Atual</p>
                  <p className="mt-0.5 font-mono text-[#0F172A]">
                    {formatDateTime(approval.currentStartWork)}
                  </p>
                  <p className={cn("font-mono", pendingClosure ? "text-[#B91C1C]" : "text-[#0F172A]")}>
                    {pendingClosure ? "Sem saída" : formatDateTime(approval.currentEndWork)}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#64748B]">{currentDiff}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-[#94A3B8]" aria-hidden="true" />
                <div className="rounded-xl border border-[#FCD34D]/60 bg-[#FEF3C7]/50 px-2 py-1">
                  <p className="font-semibold uppercase tracking-[0.18em] text-[#92400E]">Proposto</p>
                  <p className="mt-0.5 font-mono text-[#0F172A]">
                    {formatDateTime(approval.newStartWork)}
                  </p>
                  <p className="font-mono text-[#0F172A]">{formatDateTime(approval.newEndWork)}</p>
                  <p className="mt-0.5 text-[10px] text-[#92400E]">{newDiff}</p>
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
            </button>
          );
        })}
      </div>
    </Card>
  );
};

export default ApprovalDesktopList;
