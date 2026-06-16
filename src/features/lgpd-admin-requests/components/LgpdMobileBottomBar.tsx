import { ShieldCheck } from "lucide-react";
import type { LgpdRequestAdminListResponse } from "@/service/lgpd.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getStatusLabel, getTypeLabel, isSensitiveType } from "../utils/lgpd-formatters";

interface LgpdMobileBottomBarProps {
  request: LgpdRequestAdminListResponse | null;
  onOpenDetails: (requestId: string) => void;
}

export const LgpdMobileBottomBar = ({ request, onOpenDetails }: LgpdMobileBottomBarProps) => {
  if (!request) return null;

  const sensitive = isSensitiveType(request.type);
  const overdue = request.isOverdue;

  return (
    <div className="sticky bottom-4 z-30 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-[0_18px_50px_rgba(11,18,32,0.18)]">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
          Selecionado: {request.employeeFullName || "—"}
        </p>
        <p className="text-xs text-[#334155]">
          {getTypeLabel(request.type)} · {getStatusLabel(request.status).toLowerCase()}
          {overdue ? " · atrasado" : ""}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {sensitive ? (
            <Badge
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em]",
                "border-[#DDD6FE] bg-[#EDE9FE] text-[#5B21B6]"
              )}
            >
              <ShieldCheck className="mr-1 h-3 w-3" />
              sensível
            </Badge>
          ) : null}
          {overdue ? (
            <Badge
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em]",
                "border-[#FECACA] bg-[#FEE2E2] text-[#B91C1C]"
              )}
            >
              SLA crítico
            </Badge>
          ) : null}
        </div>
      </div>

      <Button
        onClick={() => onOpenDetails(request.requestId)}
        className="mt-3 h-11 w-full gap-2 rounded-2xl bg-[#2563EB] px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.18)] hover:bg-[#1D4ED8]"
      >
        Abrir detalhes
      </Button>
    </div>
  );
};

export default LgpdMobileBottomBar;
