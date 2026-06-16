import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { LgpdRequestHistoryItem } from "@/service/lgpd.service";
import { formatLgpdDateTime } from "../utils/lgpdCaseFormatters";
import { getStatusTone } from "@/features/lgpd-admin-requests/utils/lgpd-formatters";

interface LgpdCaseHistoryProps {
  history: LgpdRequestHistoryItem[];
  variant: "desktop" | "mobile";
}

export const LgpdCaseHistory = ({ history, variant }: LgpdCaseHistoryProps) => {
  return (
    <Card className="border border-[#E2E8F0] bg-white p-5 shadow-[0_10px_30px_rgba(11,18,32,0.06)]">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#1F4E5F]" />
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#64748B]">
            {variant === "mobile" ? "Histórico" : "Histórico do caso"}
          </p>
        </div>

        {history.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] py-6 text-center text-sm text-[#64748B]">
            Nenhum histórico disponível
          </p>
        ) : (
          <ol className="relative space-y-3 pl-3">
            <span
              aria-hidden="true"
              className="absolute left-1 top-2 h-[calc(100%-1rem)] w-px bg-[#E2E8F0]"
            />
            {history.map((item) => {
              const tone = getStatusTone(item.status);
              return (
                <li key={item.historyId} className="relative pl-4">
                  <span
                    aria-hidden="true"
                    className={`absolute left-[-3px] top-2 h-2 w-2 rounded-full ${tone.dot}`}
                  />
                  <div className="flex flex-col gap-1 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-0.5">
                      <p className="truncate text-sm font-semibold text-[#0F172A]">
                        {tone.label}
                      </p>
                      {item.notes ? (
                        <p className="text-xs leading-5 text-[#334155]">{item.notes}</p>
                      ) : null}
                      {item.changedByUsername ? (
                        <p className="text-[11px] text-[#94A3B8]">
                          Por {item.changedByUsername}
                        </p>
                      ) : null}
                    </div>
                    <p className="shrink-0 text-[11px] text-[#64748B] sm:text-right">
                      {formatLgpdDateTime(item.createdAt)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </Card>
  );
};

export default LgpdCaseHistory;
