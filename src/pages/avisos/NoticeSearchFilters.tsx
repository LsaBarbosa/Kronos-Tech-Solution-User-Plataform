import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Filter, Plus, Search, X } from "lucide-react";
import { NOTICE_PRIORITY_OPTIONS, type NoticePriorityFilter } from "./notice-ui.helpers";

interface NoticeSearchFiltersProps {
  variant: "desktop" | "mobile";
  searchTerm: string;
  priorityFilter: NoticePriorityFilter;
  visibleCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  canCreate: boolean;
  onSearchTermChange: (value: string) => void;
  onPriorityFilterChange: (value: NoticePriorityFilter) => void;
  onCreate: () => void;
  onClearFilters: () => void;
}

const NoticeSearchFilters = ({
  variant,
  searchTerm,
  priorityFilter,
  visibleCount,
  totalCount,
  hasActiveFilters,
  canCreate,
  onSearchTermChange,
  onPriorityFilterChange,
  onCreate,
  onClearFilters,
}: NoticeSearchFiltersProps) => {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className={cn("px-4 py-4 sm:px-5", variant === "desktop" ? "space-y-4" : "space-y-4")}>
        <div className={cn("flex flex-col gap-3", variant === "desktop" ? "lg:flex-row lg:items-end lg:justify-between" : "")}>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Busca e filtros
            </p>
            <p className="text-sm text-muted-foreground">
              {visibleCount} de {totalCount} avisos exibidos
            </p>
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters ? (
              <Button type="button" variant="ghost" size="sm" onClick={onClearFilters} className="h-9">
                <X className="h-4 w-4" />
                Limpar filtros
              </Button>
            ) : null}

            {variant === "desktop" && canCreate ? (
              <Button type="button" size="sm" onClick={onCreate} className="h-9 bg-primary text-primary-foreground">
                <Plus className="h-4 w-4" />
                Novo aviso
              </Button>
            ) : null}
          </div>
        </div>

        <div className={cn("grid gap-3", variant === "desktop" ? "lg:grid-cols-[minmax(0,1.2fr)_auto]" : "")}>
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
              placeholder="Buscar por título ou conteúdo"
              aria-label="Buscar avisos por título ou conteúdo"
              className="h-11 border-border/70 bg-background pl-10"
            />
          </label>

          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {NOTICE_PRIORITY_OPTIONS.map(({ value, label }) => {
              const active = priorityFilter === value;
              return (
                <Button
                  key={value}
                  type="button"
                  variant={active ? "default" : "outline"}
                  size="sm"
                  aria-pressed={active}
                  onClick={() => onPriorityFilterChange(value)}
                  className={cn(
                    "h-9",
                    active && "shadow-sm ring-2 ring-primary/15",
                    value === "CRITICAL" && !active && "border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800",
                    value === "ALERT" && !active && "border-amber-200 text-amber-800 hover:bg-amber-50 hover:text-amber-900"
                  )}
                >
                  {label}
                </Button>
              );
            })}
          </div>
        </div>

      </CardContent>
    </Card>
  );
};

export default NoticeSearchFilters;
