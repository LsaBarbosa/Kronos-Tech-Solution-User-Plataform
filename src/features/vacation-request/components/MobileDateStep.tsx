import { useMemo } from "react";
import { CalendarDays, CheckCircle2, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ptBR } from "date-fns/locale";
import { getVacationRangeDayChips, getVacationPeriodSummary, isVacationDateDisabled } from "../utils/vacation-date-utils";

interface MobileDateStepProps {
  startDate?: Date;
  endDate?: Date;
  dayCount: number;
  businessDays: number;
  weekendCount: number;
  validationMessage?: string;
  onStartDateChange: (date?: Date) => void;
  onEndDateChange: (date?: Date) => void;
}

const MobileDateStep = ({
  startDate,
  endDate,
  dayCount,
  businessDays,
  weekendCount,
  validationMessage,
  onStartDateChange,
  onEndDateChange,
}: MobileDateStepProps) => {
  const summary = useMemo(() => getVacationPeriodSummary(startDate, endDate), [endDate, startDate]);
  const chips = useMemo(() => getVacationRangeDayChips(startDate, endDate), [endDate, startDate]);
  const hasValidPeriod = summary.isValid;

  return (
    <Card className="rounded-[28px] border border-[#E2E8F0] bg-white shadow-[0_16px_40px_rgba(16,26,51,0.08)]">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-[#BFDBFE] bg-[#EFF6FF] text-[#1E3A8A]">
            <CalendarDays className="mr-1 h-3.5 w-3.5" />
            Passo 1
          </Badge>
        </div>
        <CardTitle className="text-2xl text-[#0F172A]">Escolha o intervalo</CardTitle>
        <CardDescription className="text-[#64748B]">Datas futuras e período contínuo.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[22px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Início</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[#2563EB]">
              {startDate ? summary.startLabel : "Selecione"}
            </p>
          </div>
          <div className="rounded-[22px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Fim</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[#2563EB]">
              {endDate ? summary.endLabel : "Selecione"}
            </p>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#E2E8F0] bg-[#F8FAFC] p-2">
          <Calendar
            mode="range"
            selected={startDate ? { from: startDate, to: endDate } : undefined}
            onSelect={(range) => {
              onStartDateChange(range?.from);
              onEndDateChange(range?.to);
            }}
            locale={ptBR}
            disabled={isVacationDateDisabled}
            numberOfMonths={1}
            fixedWeeks
            className="p-0"
          />
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="flex gap-2">
            {chips.length > 0 ? (
              chips.map((day) => {
                const active = hasValidPeriod;

                return (
                  <div
                    key={day.date.toISOString()}
                    className={cn(
                      "min-w-14 rounded-[18px] border px-2 py-2 text-center",
                      active
                        ? "border-[#2563EB] bg-[#2563EB] text-white"
                        : "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]"
                    )}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em]">{day.weekdayLabel}</p>
                    <p className="mt-1 text-lg font-semibold">{day.dayLabel}</p>
                  </div>
                );
              })
            ) : (
              <div className="rounded-[18px] border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#64748B]">
                Selecione as datas para ver o intervalo.
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[20px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Dias corridos</p>
            <p className="mt-2 text-2xl font-semibold text-[#2563EB]">{dayCount}</p>
          </div>
          <div className="rounded-[20px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Dias úteis</p>
            <p className="mt-2 text-2xl font-semibold text-[#16A34A]">{businessDays}</p>
          </div>
          <div className="rounded-[20px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Fins de semana</p>
            <p className="mt-2 text-2xl font-semibold text-[#0F172A]">{weekendCount}</p>
          </div>
        </div>

        <div
          className={cn(
            "rounded-[22px] border p-4 text-sm leading-6",
            hasValidPeriod
              ? "border-[#B7E4C7] bg-[#DCFCE7] text-[#166534]"
              : validationMessage
                ? "border-[#F3D08A] bg-[#FEF3C7] text-[#9A3412]"
                : "border-[#BFDBFE] bg-[#EFF6FF] text-[#1E3A8A]"
          )}
        >
          <div className="flex items-start gap-2">
            {hasValidPeriod ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4" />
            ) : (
              <Clock3 className="mt-0.5 h-4 w-4" />
            )}
            <p>{validationMessage ?? "Escolha datas futuras e mantenha um período contínuo."}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileDateStep;

