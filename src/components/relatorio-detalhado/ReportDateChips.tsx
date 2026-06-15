import { useMemo, useState } from "react";
import { ptBR } from "date-fns/locale";
import { CalendarDays, Calendar as CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatPeriodLabel, formatReportChipDate, formatSelectedDatesLabel, sortDates } from "@/components/relatorio-detalhado/report-ui.helpers";

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
