import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface FiscalMonthPickerProps {
  value: Date | undefined;
  onChange: (value: Date | undefined) => void;
  disabled?: boolean;
  label?: string;
}

const FiscalMonthPicker = ({
  value,
  onChange,
  disabled,
  label = "Mês de referência",
}: FiscalMonthPickerProps) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (date: Date | undefined) => {
    onChange(date);
    setOpen(false);
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">
        {label}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
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
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleSelect}
            initialFocus
            locale={ptBR}
            disabled={(date) => date > new Date()}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FiscalMonthPicker;
