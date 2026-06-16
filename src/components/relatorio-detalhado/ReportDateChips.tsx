import { useMemo, useState } from "react";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";
import {
  Briefcase,
  CalendarDays,
  Calendar as CalendarIcon,
  CalendarRange,
  PartyPopper,
  Sun,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatPeriodLabel, formatReportChipDate, formatSelectedDatesLabel, sortDates } from "@/components/relatorio-detalhado/report-ui.helpers";
import {
  getFullMonthDates,
  getHolidayDatesOfMonth,
  getWeekdayDatesOfMonth,
  getWeekendDatesOfMonth,
  resolveReferenceMonth,
} from "@/components/relatorio-detalhado/report-date-presets";

type ReportDateChipsProps = {
  selectedDates: Date[];
  onDatesChange: (dates: Date[]) => void;
  onRemoveDate: (date: Date) => void;
  onClearDates: () => void;
  compact?: boolean;
};

export const ReportDateChips = ({
  selectedDates,
  onDatesChange,
  onRemoveDate,
  onClearDates,
  compact = false,
}: ReportDateChipsProps) => {
  const [open, setOpen] = useState(false);

  const sortedDates = useMemo(() => sortDates(selectedDates), [selectedDates]);
  const selectedLabel = formatSelectedDatesLabel(selectedDates);
  const periodLabel = formatPeriodLabel(selectedDates);

  const referenceMonth = useMemo(() => resolveReferenceMonth(selectedDates), [selectedDates]);
  const referenceLabel = useMemo(
    () =>
      format(new Date(referenceMonth.year, referenceMonth.month, 1), "MMMM 'de' yyyy", {
        locale: ptBR,
      }),
    [referenceMonth.month, referenceMonth.year]
  );
  const holidayCount = useMemo(
    () => getHolidayDatesOfMonth(referenceMonth.year, referenceMonth.month).length,
    [referenceMonth.month, referenceMonth.year]
  );

  const applyPreset = (dates: Date[]) => {
    onDatesChange(dates);
  };

  const PRESET_BUTTONS: {
    key: string;
    label: string;
    helper: string;
    Icon: typeof CalendarRange;
    onClick: () => void;
    disabled?: boolean;
  }[] = [
    {
      key: "full-month",
      label: "Mês inteiro",
      helper: "todas as datas",
      Icon: CalendarRange,
      onClick: () => applyPreset(getFullMonthDates(referenceMonth.year, referenceMonth.month)),
    },
    {
      key: "weekdays",
      label: "Dias úteis",
      helper: "segunda a sexta",
      Icon: Briefcase,
      onClick: () => applyPreset(getWeekdayDatesOfMonth(referenceMonth.year, referenceMonth.month)),
    },
    {
      key: "weekends",
      label: "Finais de semana",
      helper: "sábado e domingo",
      Icon: Sun,
      onClick: () => applyPreset(getWeekendDatesOfMonth(referenceMonth.year, referenceMonth.month)),
    },
    {
      key: "holidays",
      label: "Feriados",
      helper: holidayCount > 0 ? `${holidayCount} feriado(s) no mês` : "nenhum no mês",
      Icon: PartyPopper,
      onClick: () => applyPreset(getHolidayDatesOfMonth(referenceMonth.year, referenceMonth.month)),
      disabled: holidayCount === 0,
    },
  ];

  return (
    <Card className="border border-[#D8E2EC] bg-white shadow-[0_10px_30px_rgba(16,42,67,0.08)]">
      <CardHeader className="space-y-2 border-b border-[#D8E2EC] pb-4">
        <CardTitle className="flex items-center gap-2 text-base text-[#102A43]">
          <CalendarDays className="h-4 w-4 text-[#1F4E5F]" />
          Datas selecionadas
        </CardTitle>
        <p className="text-sm leading-6 text-[#627D98]">
          Selecione uma ou mais datas. Pelo menos uma data é obrigatória para gerar o relatório.
        </p>
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        <div className="space-y-2 rounded-2xl border border-[#D8E2EC] bg-[#F8FAFC] p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#627D98]">
              Atalhos do mês
            </p>
            <p className="truncate text-[11px] text-[#627D98]">{referenceLabel}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PRESET_BUTTONS.map((preset) => {
              const Icon = preset.Icon;
              return (
                <Button
                  key={preset.key}
                  type="button"
                  variant="outline"
                  onClick={preset.onClick}
                  disabled={preset.disabled}
                  className="h-auto flex-col items-start gap-1 rounded-2xl border-[#D8E2EC] bg-white p-3 text-left text-[#102A43] hover:border-[#1F4E5F] hover:bg-[#F1F5F9] disabled:opacity-60"
                >
                  <span className="inline-flex items-center gap-2 text-sm font-semibold">
                    <Icon className="h-4 w-4 text-[#1F4E5F]" />
                    {preset.label}
                  </span>
                  <span className="text-[11px] font-normal text-[#627D98]">{preset.helper}</span>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" className="h-10 rounded-full border-[#D8E2EC] bg-[#F5F8FB] px-4 text-sm text-[#102A43] hover:border-[#1F4E5F] hover:bg-white">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Adicionar datas
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[calc(100vw-2rem)] max-w-sm border-[#D8E2EC] bg-white p-0 shadow-[0_18px_40px_rgba(16,42,67,0.12)] sm:w-auto">
              <Calendar
                mode="multiple"
                selected={selectedDates}
                onSelect={(dates) => onDatesChange(dates ?? [])}
                locale={ptBR}
                className="rounded-2xl"
              />
            </PopoverContent>
          </Popover>

          {selectedDates.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              onClick={onClearDates}
              className="h-10 rounded-full px-3 text-sm text-[#1F4E5F] hover:bg-[#EFF6FF]"
            >
              Limpar datas
            </Button>
          )}
        </div>

        <div className={cn("flex flex-wrap gap-2", compact ? "max-h-32 overflow-y-auto pr-1" : "")}>
          {sortedDates.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#D8E2EC] bg-[#F5F8FB] px-4 py-3 text-sm text-[#627D98]">
              Nenhuma data selecionada.
            </div>
          ) : (
            sortedDates.map((date) => (
              <button
                key={date.toISOString()}
                type="button"
                onClick={() => onRemoveDate(date)}
                className="inline-flex items-center gap-2 rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-2 text-sm font-medium text-[#1D4ED8] transition-colors hover:bg-[#DBEAFE]"
              >
                {formatReportChipDate(date)}
                <X className="h-3.5 w-3.5" />
              </button>
            ))
          )}
        </div>

        <div className="rounded-2xl border border-[#D8E2EC] bg-[#F5F8FB] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#627D98]">Resumo do período</p>
          <p className="mt-1 text-sm font-semibold text-[#102A43]">{selectedLabel}</p>
          <p className="mt-1 text-xs leading-5 text-[#627D98]">
            {periodLabel}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportDateChips;
