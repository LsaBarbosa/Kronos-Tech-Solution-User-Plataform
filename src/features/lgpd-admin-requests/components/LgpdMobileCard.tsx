import type { KeyboardEvent } from "react";
import { ChevronRight } from "lucide-react";
import type { LgpdRequestAdminListResponse } from "@/service/lgpd.service";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getInitials, isSensitiveType } from "../utils/lgpd-formatters";
import { LgpdSlaBadge } from "./LgpdSlaBadge";
import { LgpdStatusBadge } from "./LgpdStatusBadge";

interface LgpdMobileCardProps {
  request: LgpdRequestAdminListResponse;
  isSelected: boolean;
  onSelect: (request: LgpdRequestAdminListResponse) => void;
  onOpenDetails: (requestId: string) => void;
}

export const LgpdMobileCard = ({
  request,
  isSelected,
  onSelect,
  onOpenDetails,
}: LgpdMobileCardProps) => {
  const sensitive = isSensitiveType(request.type);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpenDetails(request.requestId);
    }
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden border border-[#E2E8F0] bg-white shadow-[0_10px_30px_rgba(11,18,32,0.06)] transition-colors",
        isSelected && "ring-2 ring-[#2563EB]"
      )}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={`Selecionar solicitação de ${
          request.employeeFullName || "funcionário"
        }`}
        onClick={() => onSelect(request)}
        onKeyDown={handleKeyDown}
        className="flex w-full items-start gap-3 p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
      >
        <span
          aria-hidden="true"
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold",
            sensitive ? "bg-[#EDE9FE] text-[#5B21B6]" : "bg-[#DBEAFE] text-[#1D4ED8]"
          )}
        >
          {getInitials(request.employeeFullName)}
        </span>
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="truncate text-sm font-semibold text-[#0F172A]">
            {request.employeeFullName || "—"}
          </p>
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.04em] text-[#94A3B8]">
            {request.type}
          </p>
          <p className="truncate text-[11px] text-[#64748B]">
            {request.companyName || "—"}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <LgpdStatusBadge status={request.status} />
            <LgpdSlaBadge createdAt={request.createdAt} isOverdue={request.isOverdue} />
          </div>
        </div>
        <button
          type="button"
          aria-label={`Abrir detalhes da solicitação ${request.requestId}`}
          onClick={(event) => {
            event.stopPropagation();
            onOpenDetails(request.requestId);
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#2563EB] transition-colors hover:bg-[#EFF6FF]"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </Card>
  );
};

export default LgpdMobileCard;
