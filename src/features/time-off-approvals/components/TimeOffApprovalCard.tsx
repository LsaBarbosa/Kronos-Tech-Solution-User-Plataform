import { Download, FileText, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TimeOffApprovalViewModel } from "../types";
import { getInitials } from "../utils/timeOffApprovalFormatters";
import TimeOffApprovalStatusBadge from "./TimeOffApprovalStatusBadge";

interface TimeOffApprovalCardProps {
  request: TimeOffApprovalViewModel;
  variant: "desktop" | "mobile";
  selected: boolean;
  onSelect: (request: TimeOffApprovalViewModel) => void;
  onDownload?: (request: TimeOffApprovalViewModel) => void;
}

const TimeOffApprovalCard = ({
  request,
  variant,
  selected,
  onSelect,
  onDownload,
}: TimeOffApprovalCardProps) => {
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
            <p className="truncate text-sm font-semibold text-[#0F172A]" title={request.employeeName}>
              {request.employeeName}
            </p>
            <TimeOffApprovalStatusBadge
              status={request.record.statusRecord}
              label={request.statusLabel}
            />
          </div>
          <p className="text-xs text-[#64748B]">{request.kindLabel}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[11px] text-[#475569]">
        <div>
          <p className="font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">Início</p>
          <p className="mt-0.5 text-[#0F172A]">
            {request.formattedStartDate} · {request.startHour}
          </p>
        </div>
        <div>
          <p className="font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">Fim</p>
          <p className="mt-0.5 text-[#0F172A]">
            {request.formattedEndDate} · {request.endHour}
          </p>
        </div>
        <div>
          <p className="font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">Horas</p>
          <p className="mt-0.5 font-semibold text-[#1D4ED8]">{request.hoursWork || "—"}</p>
        </div>
      </div>

      {request.documentId ? (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-[#DDD6FE] bg-[#F5F3FF] px-3 py-2 text-xs text-[#5B21B6]">
          <span className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" />
            Evidência anexada
          </span>
          {onDownload ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={`Baixar evidência de ${request.employeeName}`}
              onClick={(event) => {
                event.stopPropagation();
                onDownload(request);
              }}
              className="h-8 gap-1 px-2 text-[#5B21B6] hover:bg-[#EDE9FE]"
            >
              <Download className="h-3.5 w-3.5" />
              Baixar
            </Button>
          ) : null}
        </div>
      ) : (
        <p className="flex items-center gap-1.5 text-[11px] text-[#94A3B8]">
          <Paperclip className="h-3 w-3" />
          Sem evidência anexada
        </p>
      )}
    </button>
  );
};

export default TimeOffApprovalCard;
