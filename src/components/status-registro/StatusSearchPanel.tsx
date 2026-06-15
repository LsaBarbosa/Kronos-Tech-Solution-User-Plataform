import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarIcon,
  Eraser,
  Loader2,
  Search,
  UserCheck,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Employee } from "@/utils/report-utils";
import { SEARCH_STATUS_OPTIONS } from "./status-registro-helpers";

interface StatusSearchPanelProps {
  variant: "desktop" | "mobile";
  employees: Employee[];
  selectedEmployee: string;
  onSelectEmployee: (value: string) => void;
  employeeActive: "active" | "inactive";
  onEmployeeActiveChange: (value: "active" | "inactive") => void;
  selectedDates: Date[];
  onSelectedDatesChange: (dates: Date[]) => void;
  searchStatuses: string[];
  onToggleStatus: (status: string) => void;
  isActiveFilter: boolean;
  onIsActiveFilterChange: (value: boolean) => void;
  isPartner: boolean;
  isLoadingEmployees: boolean;
  isSearching: boolean;
  onSearch: () => void;
  onClear: () => void;
}

const StatusSearchPanel = ({
  variant,
  employees,
  selectedEmployee,
  onSelectEmployee,
  employeeActive,
  onEmployeeActiveChange,
  selectedDates,
  onSelectedDatesChange,
  searchStatuses,
  onToggleStatus,
  isActiveFilter,
  onIsActiveFilterChange,
  isPartner,
  isLoadingEmployees,
  isSearching,
  onSearch,
  onClear,
}: StatusSearchPanelProps) => {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const datesLabel =
    selectedDates.length === 0
      ? "Selecione as datas"
      : selectedDates.length === 1
        ? format(selectedDates[0], "dd/MM/yyyy", { locale: ptBR })
        : `${selectedDates.length} datas selecionadas`;

  return (
    <div className={cn("space-y-4", variant === "desktop" && "space-y-5")}>
      {!isPartner ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="status-employee-active"
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]"
            >
              Status do colaborador
            </Label>
            <Select
              value={employeeActive}
              onValueChange={(value) => onEmployeeActiveChange(value as "active" | "inactive")}
            >
              <SelectTrigger id="status-employee-active" className="h-11">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  <span className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-[#16A34A]" />
                    Ativos
                  </span>
                </SelectItem>
                <SelectItem value="inactive">
                  <span className="flex items-center gap-2">
                    <UserX className="h-4 w-4 text-[#DC2626]" />
                    Inativos
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="status-employee"
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]"
            >
              Colaborador
            </Label>
            <Select
              value={selectedEmployee}
              onValueChange={onSelectEmployee}
              disabled={isLoadingEmployees || employees.length === 0}
            >
              <SelectTrigger id="status-employee" className="h-11">
                <SelectValue
                  placeholder={isLoadingEmployees ? "Carregando..." : "Selecione"}
                />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.employeeId} value={employee.employeeId}>
                    {employee.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-[#99F6E4] bg-[#F0FDFA] px-3 py-2.5 text-xs leading-5 text-[#0F766E]">
          Colaborador bloqueado pela sessão (perfil Colaborador).
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">
          Status atual (multi)
        </Label>
        <div
          role="group"
          aria-label="Status atual do registro"
          className="flex flex-wrap gap-2"
        >
          {SEARCH_STATUS_OPTIONS.map((option) => {
            const isActive = searchStatuses.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onToggleStatus(option.value)}
                aria-pressed={isActive}
                className={cn(
                  "inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2",
                  isActive
                    ? "border-[#2563EB] bg-[#2563EB] text-white shadow-sm"
                    : cn("hover:border-[#2563EB] hover:bg-[#EFF6FF]", option.tone.badgeClass)
                )}
              >
                {!isActive ? (
                  <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", option.tone.dotClass)} />
                ) : null}
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">
            Datas (opcional)
          </Label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "h-11 w-full justify-start border-[#E2E8F0] bg-white text-left font-normal text-[#0F172A] hover:bg-[#F4F6F9]",
                  selectedDates.length === 0 && "text-[#64748B]"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {datesLabel}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="multiple"
                selected={selectedDates}
                onSelect={(dates) => onSelectedDatesChange(dates ?? [])}
                locale={ptBR}
                initialFocus
              />
              {selectedDates.length > 0 ? (
                <div className="flex items-center justify-between gap-2 border-t border-border/60 px-3 py-2">
                  <span className="text-[11px] text-[#64748B]">
                    {selectedDates.length} selecionada(s)
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectedDatesChange([])}
                    className="h-8 text-[#475569] hover:bg-[#F1F5F9]"
                  >
                    Limpar
                  </Button>
                </div>
              ) : null}
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">
            Visibilidade
          </Label>
          <Select
            value={isActiveFilter ? "true" : "false"}
            onValueChange={(value) => onIsActiveFilterChange(value === "true")}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Visibilidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Somente ativos</SelectItem>
              <SelectItem value="false">Incluir inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onClear}
          disabled={isSearching}
          className="h-11 gap-1 border-[#D8E2EC] bg-white text-[#102A43] hover:bg-[#F4F6F9]"
        >
          <Eraser className="h-4 w-4" />
          Limpar
        </Button>
        <Button
          type="button"
          onClick={onSearch}
          disabled={isSearching || searchStatuses.length === 0}
          className="h-11 gap-1 bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
        >
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {isSearching ? "Buscando..." : "Buscar registros"}
        </Button>
      </div>
    </div>
  );
};

export default StatusSearchPanel;
