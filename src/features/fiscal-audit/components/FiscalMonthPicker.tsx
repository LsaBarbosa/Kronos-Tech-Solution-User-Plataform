import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface FiscalMonthPickerProps {
  value: Date | undefined;
  onChange: (value: Date | undefined) => void;
  disabled?: boolean;
  label?: string;
}

const MONTH_LABELS = Array.from({ length: 12 }, (_, index) =>
  format(new Date(2000, index, 1), "MMM", { locale: ptBR })
);

const FiscalMonthPicker = ({
  value,
  onChange,
  disabled,
  label = "Mês de referência",
}: FiscalMonthPickerProps) => {
  const [open, setOpen] = useState(false);
  const today = useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const [viewYear, setViewYear] = useState<number>(
    value ? value.getFullYear() : currentYear
  );

  const handleSelectMonth = (monthIndex: number) => {
    onChange(new Date(viewYear, monthIndex, 1));
    setOpen(false);
  };

  const handlePrevYear = () => setViewYear((year) => year - 1);
  const handleNextYear = () => {
    if (viewYear >= currentYear) return;
    setViewYear((year) => year + 1);
  };

  const isMonthDisabled = (monthIndex: number) =>
    viewYear > currentYear || (viewYear === currentYear && monthIndex > currentMonth);

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">
        {label}
      </Label>
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (nextOpen) {
            setViewYear(value ? value.getFullYear() : currentYear);
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "h-11 w-full justify-start border-[#E2E8F0] bg-white text-left font-normal text-[#0F172A] hover:bg-[#F4F6F9]",
              !value && "text-[#64748B]"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value
              ? format(value, "MMMM 'de' yyyy", { locale: ptBR })
              : "Selecione o mês"}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[280px] rounded-2xl border border-border/70 bg-white p-3 shadow-xl"
          align="start"
        >
          <div className="flex items-center justify-between gap-2 pb-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Ano anterior"
              onClick={handlePrevYear}
              className="h-8 w-8 text-[#475569] hover:bg-[#F1F5F9]"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold text-[#0F172A]">{viewYear}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Próximo ano"
              onClick={handleNextYear}
              disabled={viewYear >= currentYear}
              className="h-8 w-8 text-[#475569] hover:bg-[#F1F5F9] disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {MONTH_LABELS.map((monthLabel, index) => {
              const isSelected =
                value !== undefined &&
                value.getFullYear() === viewYear &&
                value.getMonth() === index;
              const monthDisabled = isMonthDisabled(index);
              return (
                <button
                  key={monthLabel}
                  type="button"
                  onClick={() => handleSelectMonth(index)}
                  disabled={monthDisabled}
                  aria-pressed={isSelected}
                  className={cn(
                    "rounded-xl border px-2 py-2 text-xs font-semibold capitalize transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2",
                    monthDisabled
                      ? "cursor-not-allowed border-[#E2E8F0] bg-[#F8FAFC] text-[#94A3B8]"
                      : isSelected
                        ? "border-[#2563EB] bg-[#2563EB] text-white shadow-sm"
                        : "border-[#E2E8F0] bg-white text-[#0F172A] hover:border-[#2563EB] hover:bg-[#EFF6FF]"
                  )}
                >
                  {monthLabel}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FiscalMonthPicker;
