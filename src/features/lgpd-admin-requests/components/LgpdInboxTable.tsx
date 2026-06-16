import type { KeyboardEvent } from "react";
import type { LgpdRequestAdminListResponse } from "@/service/lgpd.service";
import { cn } from "@/lib/utils";
import { ChevronRight, Inbox, Loader2 } from "lucide-react";
import { getInitials, isSensitiveType } from "../utils/lgpd-formatters";
import { LgpdStatusBadge } from "./LgpdStatusBadge";
import { LgpdTypeBadge } from "./LgpdTypeBadge";
import { LgpdSlaBadge } from "./LgpdSlaBadge";

interface LgpdInboxTableProps {
  requests: LgpdRequestAdminListResponse[];
  selectedRequestId: string | null;
  onSelect: (request: LgpdRequestAdminListResponse) => void;
  onOpenDetails: (requestId: string) => void;
  isLoading: boolean;
}

const GRID_TEMPLATE =
  "grid-cols-[minmax(220px,1.7fr)_minmax(140px,1fr)_minmax(180px,1fr)_minmax(220px,1.2fr)_minmax(90px,90px)_44px]";

export const LgpdInboxTable = ({
  requests,
  selectedRequestId,
  onSelect,
  onOpenDetails,
  isLoading,
}: LgpdInboxTableProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#E2E8F0] bg-white px-6 py-16 text-center">
        <Inbox className="h-10 w-10 text-[#94A3B8]" />
        <p className="text-sm font-semibold text-[#0F172A]">Nenhuma solicitação encontrada</p>
        <p className="text-xs text-[#64748B]">
          Ajuste os filtros para ver outras requisições da fila.
        </p>
      </div>
    );
  }

  const handleRowKeyDown =
    (request: LgpdRequestAdminListResponse) => (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onOpenDetails(request.requestId);
      }
    };

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#E2E8F0] bg-white">
      <div className="min-w-[1080px]">
        <div
          className={cn(
            "grid gap-x-6 border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64748B]",
            GRID_TEMPLATE
          )}
        >
          <span>Titular</span>
          <span>Empresa</span>
          <span>Tipo</span>
          <span>Status</span>
          <span>SLA</span>
          <span className="sr-only">Ações</span>
        </div>
        <ul className="divide-y divide-[#E2E8F0]">
          {requests.map((request) => {
            const isSelected = request.requestId === selectedRequestId;
            const sensitive = isSensitiveType(request.type);
            return (
              <li key={request.requestId} className="relative">
                {isSelected ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-1 left-0 w-1 rounded-r-full bg-[#2563EB]"
                  />
                ) : null}
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={`Abrir detalhes da solicitação de ${
                    request.employeeFullName || "funcionário"
                  }`}
                  onClick={() => onSelect(request)}
                  onKeyDown={handleRowKeyDown(request)}
                  className={cn(
                    "grid cursor-pointer items-center gap-x-6 px-6 py-4 outline-none transition-colors hover:bg-[#F8FAFC] focus-visible:bg-[#EFF6FF] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2563EB]",
                    GRID_TEMPLATE,
                    isSelected && "bg-[#EFF6FF] hover:bg-[#EFF6FF]"
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        sensitive
                          ? "bg-[#EDE9FE] text-[#5B21B6]"
                          : "bg-[#DBEAFE] text-[#1D4ED8]"
                      )}
                    >
                      {getInitials(request.employeeFullName)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#0F172A]">
                        {request.employeeFullName || "—"}
                      </p>
                      <p className="truncate text-[11px] text-[#94A3B8]">
                        request-{request.requestId.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                  <p className="truncate text-sm text-[#334155]">
                    {request.companyName || "—"}
                  </p>
                  <div className="flex min-w-0">
                    <LgpdTypeBadge
                      type={request.type}
                      display="code"
                      className="max-w-full whitespace-nowrap"
                    />
                  </div>
                  <div className="flex min-w-0">
                    <LgpdStatusBadge
                      status={request.status}
                      className="max-w-full whitespace-nowrap"
                    />
                  </div>
                  <div className="flex">
                    <LgpdSlaBadge createdAt={request.createdAt} isOverdue={request.isOverdue} />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      aria-label={`Abrir detalhes da solicitação ${request.requestId}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenDetails(request.requestId);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[#64748B] transition-colors hover:bg-[#EFF6FF] hover:text-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default LgpdInboxTable;
