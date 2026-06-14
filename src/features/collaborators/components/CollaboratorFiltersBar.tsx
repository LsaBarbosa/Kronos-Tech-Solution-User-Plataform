import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Filter, Search, X } from "lucide-react";
import { filterGroupOptions, filterStatusOptions } from "../utils/collaborator-view.helpers";
import type { CollaboratorFilters } from "../types/collaborator-view.types";

type CollaboratorFiltersBarProps = {
  variant: "desktop" | "mobile";
  filters: CollaboratorFilters;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: CollaboratorFilters["status"]) => void;
  onGroupChange: (value: CollaboratorFilters["group"]) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
};

const FilterChip = ({
  active,
  label,
  onClick,
  className,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  className?: string;
}) => (
  <Button
    type="button"
    variant="outline"
    onClick={onClick}
    className={cn(
      "h-10 rounded-full px-4 text-sm transition-all",
      active
        ? "border-[#2563EB] bg-[#2563EB] text-white hover:bg-[#2563EB]"
        : "border-[#CBD5E1] bg-white text-[#64748B] hover:border-[#2563EB] hover:bg-[#EFF6FF] hover:text-[#1E3A8A]",
      className
    )}
  >
    {label}
  </Button>
);

export const CollaboratorFiltersBar = ({
  variant,
  filters,
  onSearchChange,
  onStatusChange,
  onGroupChange,
  onClearFilters,
  hasActiveFilters,
}: CollaboratorFiltersBarProps) => {
  if (variant === "mobile") {
    return (
      <div className="space-y-4 rounded-[24px] border border-[#E2E8F0] bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
        <div className="flex items-center gap-3 rounded-[18px] border border-[#CBD5E1] bg-[#F8FAFC] px-4">
          <Search className="h-5 w-5 text-[#2563EB]" />
          <Input
            value={filters.search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar nome, usuário ou cargo"
            className="h-12 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {filterStatusOptions.map((option) => (
            <FilterChip
              key={option.id}
              label={option.label}
              active={filters.status === option.id}
              onClick={() => onStatusChange(option.id)}
              className="shrink-0"
            />
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {filterGroupOptions.map((option) => (
            <FilterChip
              key={option.id}
              label={option.label}
              active={filters.group === option.id}
              onClick={() => onGroupChange(option.id)}
              className="shrink-0"
            />
          ))}
        </div>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="outline"
            onClick={onClearFilters}
            className="h-11 w-full rounded-full border-[#CBD5E1] text-[#1E3A8A]"
          >
            <X className="mr-2 h-4 w-4" />
            Limpar filtros
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-[26px] border border-[#E2E8F0] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-[#1E3A8A]">
            <Filter className="h-4 w-4" />
            Mapa operacional de colaboradores
          </div>
          <p className="text-sm text-[#64748B]">Busca, filtros e ações rápidas sem perder contexto.</p>
        </div>
        {hasActiveFilters && (
          <Button
            type="button"
            variant="outline"
            onClick={onClearFilters}
            className="h-10 rounded-full border-[#CBD5E1] text-[#1E3A8A]"
          >
            <X className="mr-2 h-4 w-4" />
            Limpar filtros
          </Button>
        )}
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="flex items-center gap-3 rounded-[18px] border border-[#CBD5E1] bg-[#F8FAFC] px-4">
          <Search className="h-5 w-5 text-[#2563EB]" />
          <Input
            value={filters.search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por nome, usuário ou cargo"
            className="h-12 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {filterStatusOptions.map((option) => (
            <FilterChip
              key={option.id}
              label={option.label}
              active={filters.status === option.id}
              onClick={() => onStatusChange(option.id)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {filterGroupOptions.map((option) => (
          <FilterChip
            key={option.id}
            label={option.label}
            active={filters.group === option.id}
            onClick={() => onGroupChange(option.id)}
          />
        ))}
      </div>
    </div>
  );
};

