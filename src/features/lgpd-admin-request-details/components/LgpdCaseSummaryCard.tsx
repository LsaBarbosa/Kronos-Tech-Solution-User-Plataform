import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LgpdRequestDetailsResponse } from "@/service/lgpd.service";
import { LgpdSlaBadge } from "@/features/lgpd-admin-requests/components/LgpdSlaBadge";
import { LgpdStatusBadge } from "@/features/lgpd-admin-requests/components/LgpdStatusBadge";
import { LgpdTypeBadge } from "@/features/lgpd-admin-requests/components/LgpdTypeBadge";
import { getInitials, isSensitiveType } from "../utils/lgpdCaseFormatters";

interface LgpdCaseSummaryCardProps {
  request: LgpdRequestDetailsResponse;
  variant: "desktop" | "mobile";
  isOverdue?: boolean;
}

export const LgpdCaseSummaryCard = ({
  request,
  variant,
  isOverdue = false,
}: LgpdCaseSummaryCardProps) => {
  const sensitive = isSensitiveType(request.request.requestType);
  const titularName = request.employee.fullName;
  const initials = getInitials(titularName);

  return (
    <Card
      className={cn(
        "border bg-white shadow-[0_10px_30px_rgba(11,18,32,0.06)]",
        sensitive ? "border-[#DDD6FE]" : "border-[#E2E8F0]"
      )}
    >
      <div
        className={cn(
          "rounded-2xl p-4",
          isOverdue ? "bg-[#FEE2E2]/30" : sensitive ? "bg-[#EDE9FE]/40" : "bg-white",
          variant === "desktop" && "p-5"
        )}
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold",
              sensitive ? "bg-[#EDE9FE] text-[#5B21B6]" : "bg-[#DBEAFE] text-[#1D4ED8]"
            )}
          >
            {initials}
          </span>
          <div className="min-w-0 space-y-1.5">
            <p className="truncate text-lg font-bold text-[#0F172A]">{titularName}</p>
            <p className="truncate text-xs text-[#64748B]">
              {request.company.tradeName}
              {request.employee.email ? ` · ${request.employee.email}` : ""}
              {request.employee.jobPosition ? ` · ${request.employee.jobPosition}` : ""}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <LgpdTypeBadge type={request.request.requestType} display="code" />
              <LgpdStatusBadge status={request.request.status} />
              <LgpdSlaBadge createdAt={request.request.createdAt} isOverdue={isOverdue} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default LgpdCaseSummaryCard;
