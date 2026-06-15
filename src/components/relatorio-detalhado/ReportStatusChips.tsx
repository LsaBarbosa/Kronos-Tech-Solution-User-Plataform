import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { statusOptions } from "@/utils/report-utils";

type ReportStatusChipsProps = {
  selectedStatuses: string[];
  onToggleStatus: (status: string) => void;
  onClearStatuses: () => void;
  compact?: boolean;
};

export const ReportStatusChips = ({
  selectedStatuses,
  onToggleStatus,
  onClearStatuses,
  compact = false,
}: ReportStatusChipsProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#0F172A]">Status</p>
          <p className="text-xs text-[#64748B]">Seleção múltipla e opcional.</p>
        </div>

        {selectedStatuses.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            onClick={onClearStatuses}
            className="h-8 rounded-full px-3 text-xs text-[#1E3A8A] hover:bg-[#EFF6FF]"
          >
            Limpar
          </Button>
        )}
      </div>

      <div
        className={cn(
          "grid gap-2",
          compact ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4"
        )}
      >
        {statusOptions.map((option) => {
          const active = selectedStatuses.includes(option.value);

          return (
            <Button
              key={option.value}
              type="button"
              variant="outline"
              onClick={() => onToggleStatus(option.value)}
              className={cn(
                "h-auto min-h-11 justify-start rounded-2xl border px-3 py-2 text-left leading-5 transition-all",
                active
                  ? "border-[#2563EB] bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                  : "border-[#CBD5E1] bg-white text-[#64748B] hover:border-[#2563EB] hover:bg-[#EFF6FF] hover:text-[#1E3A8A]"
              )}
            >
              <span className="min-w-0 whitespace-normal break-words text-sm font-medium">
                {option.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default ReportStatusChips;
