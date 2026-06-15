import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { VacationApprovalFilter } from "../types";

const STATUS_FILTERS: Array<{ value: VacationApprovalFilter; label: string }> = [
  { value: "PENDING", label: "Pendentes" },
  { value: "APPROVED", label: "Aprovadas" },
  { value: "REJECTED", label: "Rejeitadas" },
  { value: "ALL", label: "Todos" },
];

interface VacationApprovalFiltersProps {
  variant: "desktop" | "mobile";
  draftEmployeeName: string;
  statusFilter: VacationApprovalFilter;
  onDraftEmployeeNameChange: (value: string) => void;
  onStatusFilterChange: (value: VacationApprovalFilter) => void;
  onSearch: () => void;
  onClear: () => void;
  isBusy?: boolean;
}

export const VacationApprovalFilters = ({
  variant,
  draftEmployeeName,
  statusFilter,
  onDraftEmployeeNameChange,
  onStatusFilterChange,
  onSearch,
  onClear,
  isBusy = false,
}: VacationApprovalFiltersProps) => {
  const isCompact = variant === "mobile";

  return (
    <Card className="border border-border bg-card shadow-sm">
      <div className={cn("space-y-4 p-4 sm:p-5", isCompact && "p-4")}>
        <div className={cn("grid gap-3", variant === "desktop" ? "lg:grid-cols-[minmax(0,1fr)_auto]" : "grid-cols-1")}>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={draftEmployeeName}
              onChange={(event) => onDraftEmployeeNameChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  onSearch();
                }
              }}
              disabled={isBusy}
              placeholder="Buscar colaborador"
              className="h-11 pl-10 text-sm"
              aria-label="Buscar colaborador"
            />
          </div>

          <div className={cn("flex flex-wrap gap-2", variant === "desktop" && "lg:justify-end")}>
            <Button
              type="button"
              onClick={onSearch}
              disabled={isBusy}
              className={cn("h-11 min-w-[7.5rem] flex-1 lg:flex-none", variant === "mobile" && "flex-1")}
            >
              Buscar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClear}
              disabled={isBusy}
              className={cn("h-11 min-w-[7.5rem] flex-1 lg:flex-none", variant === "mobile" && "flex-1")}
            >
              Limpar filtros
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
          {STATUS_FILTERS.map((filter) => {
            const active = filter.value === statusFilter;

            return (
              <Button
                key={filter.value}
                type="button"
                variant="outline"
                onClick={() => onStatusFilterChange(filter.value)}
                disabled={isBusy}
                className={cn(
                  "h-10 w-full rounded-full border px-4 text-sm transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                    : "bg-background text-foreground hover:border-primary/30 hover:bg-primary/5",
                  variant === "mobile" && "min-w-[120px]"
                )}
              >
                {filter.label}
              </Button>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
