import { useMemo } from "react";
import { CalendarDays, Clock3, TreePalm } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { ManagerOption } from "@/types/vacation";
import VacationManagerSelector from "./VacationManagerSelector";
import { formatVacationDate, getVacationPeriodSummary, isVacationDateDisabled } from "../utils/vacation-date-utils";

interface VacationPeriodPlannerProps {
  startDate?: Date;
  endDate?: Date;
  managerId: string;
  managerOptions: ManagerOption[];
  selectedManager?: ManagerOption;
  isLoadingManagers: boolean;
  isSubmitting: boolean;
  managerErrorMessage?: string;
  validationMessage?: string;
  onStartDateChange: (date?: Date) => void;
  onEndDateChange: (date?: Date) => void;
  onManagerChange: (managerId: string) => void;
  className?: string;
}

const VacationPeriodPlanner = ({
  startDate,
  endDate,
  managerId,
  managerOptions,
  selectedManager,
  isLoadingManagers,
  isSubmitting,
  managerErrorMessage,
  validationMessage,
  onStartDateChange,
  onEndDateChange,
  onManagerChange,
  className,
}: VacationPeriodPlannerProps) => {
  const summary = useMemo(() => getVacationPeriodSummary(startDate, endDate), [endDate, startDate]);
  const helperMessage =
    validationMessage ??
    (summary.isValid
      ? "Período válido. A solicitação aguardará aprovação após o envio."
      : "Escolha datas futuras e mantenha um período contínuo.");
  const helperTone = summary.isValid || validationMessage ? "warning" : "info";

  const monthLabel = format(startDate ?? new Date(), "MMMM yyyy", { locale: ptBR })
    .replace(/^./, (value) => value.toUpperCase());

  const selectedRange = startDate ? { from: startDate, to: endDate } : undefined;

  return (
    <Card
      className={cn(
        "rounded-[28px] border border-[#E2E8F0] bg-white shadow-[0_16px_40px_rgba(16,26,51,0.08)]",
        className
      )}
    >
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-[#BFDBFE] bg-[#EFF6FF] text-[#1E3A8A]">
                <CalendarDays className="mr-1 h-3.5 w-3.5" />
                Solicitação de férias
              </Badge>
            </div>
            <CardTitle className="text-2xl text-[#0F172A]">Selecionar período</CardTitle>
            <CardDescription className="text-[#64748B]">
              Visualização ampla para comparar semanas, fins de semana e prazo de aprovação.
            </CardDescription>
          </div>

          <Badge
            variant="outline"
            className={cn(
              "font-semibold",
              summary.isValid ? "border-[#F3D08A] bg-[#FEF3C7] text-[#9A3412]" : "border-[#BFDBFE] bg-[#EFF6FF] text-[#1E3A8A]"
            )}
          >
            {summary.isValid ? "Período válido" : "Período em preparação"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[20px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Início</p>
            <p className="mt-2 text-lg font-semibold text-[#0F172A]">
              {startDate ? formatVacationDate(startDate) : "Selecione"}
            </p>
          </div>

          <div className="rounded-[20px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Fim</p>
            <p className="mt-2 text-lg font-semibold text-[#0F172A]">
              {endDate ? formatVacationDate(endDate) : "Selecione"}
            </p>
          </div>

          <VacationManagerSelector
            compact
            managerOptions={managerOptions}
            managerId={managerId}
            selectedManager={selectedManager}
            isLoadingManagers={isLoadingManagers}
            errorMessage={managerErrorMessage}
            onManagerChange={onManagerChange}
            isSubmitting={isSubmitting}
          />
        </div>

        <div className="rounded-[28px] border border-[#E2E8F0] bg-[#F8FAFC] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xl font-semibold text-[#0F172A]">{monthLabel}</p>
            <Badge variant="outline" className="border-[#BFDBFE] bg-[#EFF6FF] text-[#1E3A8A]">
              {summary.isValid ? `${summary.dayCount} dias` : "Aguardando seleção"}
            </Badge>
          </div>

          <div className="mt-4 overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-white p-2 shadow-sm">
            <Calendar
              mode="range"
              selected={selectedRange}
              onSelect={(range) => {
                onStartDateChange(range?.from);
                onEndDateChange(range?.to);
              }}
              locale={ptBR}
              disabled={isVacationDateDisabled}
              numberOfMonths={1}
              fixedWeeks
              className="p-1 sm:p-2"
            />
          </div>
        </div>

        <div
          className={cn(
            "rounded-[22px] border p-4 text-sm leading-6",
            helperTone === "success"
              ? "border-[#B7E4C7] bg-[#DCFCE7] text-[#166534]"
              : helperTone === "warning"
                ? "border-[#F3D08A] bg-[#FEF3C7] text-[#9A3412]"
                : "border-[#BFDBFE] bg-[#EFF6FF] text-[#1E3A8A]"
          )}
        >
          <div className="flex items-start gap-2">
            {helperTone === "warning" ? (
              <TreePalm className="mt-0.5 h-4 w-4" />
            ) : (
              <Clock3 className="mt-0.5 h-4 w-4" />
            )}
            <p>{helperMessage}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VacationPeriodPlanner;
