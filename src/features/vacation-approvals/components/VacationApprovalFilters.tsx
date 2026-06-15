import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { VacationApprovalFilterStatus } from "@/types/vacation";

interface ChipDef {
  value: VacationApprovalFilterStatus;
  label: string;
  className: string;
  activeClassName: string;
}

const STATUS_CHIPS: ChipDef[] = [
  {
    value: "PENDING",
    label: "Pendentes",
    className: "border-[#FCD34D] text-[#92400E] bg-[#FEF3C7]/60 hover:bg-[#FEF3C7]",
    activeClassName: "border-[#F59E0B] text-white bg-[#F59E0B] hover:bg-[#D97706]",
  },
  {
    value: "APPROVED",
    label: "Aprovadas",
    className: "border-[#BBF7D0] text-[#15803D] bg-[#DCFCE7]/60 hover:bg-[#DCFCE7]",
    activeClassName: "border-[#16A34A] text-white bg-[#16A34A] hover:bg-[#15803D]",
  },
  {
    value: "REJECTED",
    label: "Rejeitadas",
    className: "border-[#FECACA] text-[#B91C1C] bg-[#FEE2E2]/60 hover:bg-[#FEE2E2]",
    activeClassName: "border-[#DC2626] text-white bg-[#DC2626] hover:bg-[#B91C1C]",
  },
  {
    value: "ALL",
    label: "Todas",
    className: "border-[#E2E8F0] text-[#475569] bg-white hover:bg-[#F1F5F9]",
    activeClassName: "border-[#0B1220] text-white bg-[#0B1220] hover:bg-[#1E293B]",
  },
];

interface VacationApprovalFiltersProps {
  variant: "desktop" | "mobile";
  draftEmployeeName: string;
  onDraftEmployeeNameChange: (value: string) => void;
  statusFilter: VacationApprovalFilterStatus;
  onStatusFilterChange: (value: VacationApprovalFilterStatus) => void;
  onSearch: () => void;
  onClear: () => void;
  isBusy: boolean;
}

const VacationApprovalFilters = ({
  variant,
  draftEmployeeName,
  onDraftEmployeeNameChange,
  statusFilter,
  onStatusFilterChange,
  onSearch,
  onClear,
  isBusy,
}: VacationApprovalFiltersProps) => {
  return (
    <div className={cn("space-y-3", variant === "desktop" && "space-y-4")}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
        <div className="flex-1 space-y-1.5">
          <Label
            htmlFor="vacation-employee-search"
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]"
          >
            Buscar colaborador
          </Label>
          <Input
            id="vacation-employee-search"
            placeholder="Nome do colaborador..."
            value={draftEmployeeName}
            onChange={(event) => onDraftEmployeeNameChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onSearch();
              }
            }}
            disabled={isBusy}
            className="h-11"
          />
        </div>
        <Button
          type="button"
          onClick={onSearch}
          disabled={isBusy}
          className="h-11 gap-1 bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
        >
          <Search className="h-4 w-4" />
          Buscar
        </Button>
        {(draftEmployeeName || statusFilter !== "PENDING") && (
          <Button
            type="button"
            variant="outline"
            onClick={onClear}
            disabled={isBusy}
            className="h-11 gap-1 border-[#D8E2EC] bg-white text-[#102A43] hover:bg-[#F4F6F9]"
          >
            <X className="h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Status">
        {STATUS_CHIPS.map((chip) => {
          const isActive = statusFilter === chip.value;
          return (
            <button
              key={chip.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              disabled={isBusy}
              onClick={() => onStatusFilterChange(chip.value)}
              className={cn(
                "inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
                isActive ? chip.activeClassName : chip.className
              )}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default VacationApprovalFilters;
