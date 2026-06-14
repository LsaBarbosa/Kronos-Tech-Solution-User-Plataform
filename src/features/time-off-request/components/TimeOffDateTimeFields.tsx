import { useState } from "react";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, CalendarDays, Clock3, TimerReset } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatTimeOffDate, formatTimeOffDurationLabel } from "../utils/timeOffFormatting";
import { isTimeOffDateDisabled } from "../utils/timeOffValidation";
import type { TimeOffRequestPeriodSummary } from "../types";

interface TimeOffDateTimeFieldsProps {
  startDate?: Date;
  endDate?: Date;
  startHour: string;
  endHour: string;
  periodSummary: TimeOffRequestPeriodSummary;
  validationMessage?: string;
  onStartDateChange: (date?: Date) => void;
  onEndDateChange: (date?: Date) => void;
  onStartHourChange: (hour: string) => void;
  onEndHourChange: (hour: string) => void;
  variant?: "desktop" | "mobile";
  className?: string;
}

interface DatePickerFieldProps {
  label: string;
  value?: Date;
  onChange: (date?: Date) => void;
  variant: "desktop" | "mobile";
}

const DatePickerField = ({ label, value, onChange, variant }: DatePickerFieldProps) => {
  const [open, setOpen] = useState(false);
  const triggerLabel = value ? formatTimeOffDate(value) : "Selecionar data";

  if (variant === "mobile") {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <button
            type="button"
            className="flex min-h-12 w-full items-center justify-between rounded-[18px] border border-[#D8E2EC] bg-white px-4 py-3 text-left text-sm text-[#102A43] shadow-[0_10px_24px_rgba(16,42,67,0.06)]"
          >
            <span>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">
                {label}
              </span>
              <span className={cn("mt-1 block text-sm font-semibold", !value && "text-[#627D98]")}>{triggerLabel}</span>
            </span>
            <CalendarDays className="h-4 w-4 text-[#1F4E5F]" />
          </button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[92vh] overflow-hidden">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-[#102A43]">{label}</DrawerTitle>
            <DrawerDescription className="text-[#627D98]">Escolha a data desejada para a justificativa.</DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto px-3 pb-3">
            <Calendar
              mode="single"
              selected={value}
              onSelect={(next) => {
                onChange(next);
                setOpen(false);
              }}
              locale={ptBR}
              disabled={isTimeOffDateDisabled}
              initialFocus
              className="rounded-[24px] border border-[#D8E2EC] bg-white shadow-[0_12px_30px_rgba(16,42,67,0.08)]"
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-12 w-full justify-between rounded-[18px] border-[#D8E2EC] bg-white text-left font-normal text-[#102A43]"
        >
          <span className="text-left">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">
              {label}
            </span>
            <span className={cn("mt-1 block text-sm font-semibold", !value && "text-[#627D98]")}>{triggerLabel}</span>
          </span>
          <CalendarDays className="h-4 w-4 text-[#1F4E5F]" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(next) => {
            onChange(next);
            setOpen(false);
          }}
          locale={ptBR}
          disabled={isTimeOffDateDisabled}
          initialFocus
          className="rounded-[24px] border border-[#D8E2EC] bg-white shadow-[0_12px_30px_rgba(16,42,67,0.08)]"
        />
      </PopoverContent>
    </Popover>
  );
};

const TimeOffDateTimeFields = ({
  startDate,
  endDate,
  startHour,
  endHour,
  periodSummary,
  validationMessage,
  onStartDateChange,
  onEndDateChange,
  onStartHourChange,
  onEndHourChange,
  variant = "desktop",
  className,
}: TimeOffDateTimeFieldsProps) => {
  const isMobile = variant === "mobile";
  const summary = periodSummary;

  return (
    <Card className={cn("rounded-[28px] border border-[#D8E2EC] bg-white shadow-[0_16px_40px_rgba(16,42,67,0.10)]", className)}>
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-[#B3C2D0] bg-[#E9EEF4] text-[#102A43]">
            <TimerReset className="mr-1 h-3.5 w-3.5" />
            Período solicitado
          </Badge>
        </div>
        <CardTitle className="text-[#102A43]">{isMobile ? "Informe início e fim" : "Composição da solicitação"}</CardTitle>
        <CardDescription className="text-[#627D98]">
          {isMobile
            ? "Escolha a data inicial, a final e os horários do ajuste."
            : "O período será enviado com datas, horários e validação de sequência."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-2")}>
          <DatePickerField label="Data inicial" value={startDate} onChange={onStartDateChange} variant={variant} />
          <DatePickerField label="Data final" value={endDate} onChange={onEndDateChange} variant={variant} />
        </div>

        <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-2")}>
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">
              Hora inicial
            </span>
            <Input
              type="time"
              value={startHour}
              onChange={(event) => onStartHourChange(event.target.value)}
              className="h-12 rounded-[18px] border-[#D8E2EC] bg-white text-[#102A43]"
            />
          </label>
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">
              Hora final
            </span>
            <Input
              type="time"
              value={endHour}
              onChange={(event) => onEndHourChange(event.target.value)}
              className="h-12 rounded-[18px] border-[#D8E2EC] bg-white text-[#102A43]"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[22px] border border-[#D8E2EC] bg-[#F8FAFC] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">Dias corridos</p>
            <p className="mt-2 text-2xl font-semibold text-[#102A43]">{summary.dayCount || "—"}</p>
          </div>
          <div className="rounded-[22px] border border-[#D8E2EC] bg-[#F8FAFC] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">Duração</p>
            <p className="mt-2 text-2xl font-semibold text-[#1F4E5F]">{formatTimeOffDurationLabel(summary)}</p>
          </div>
          <div className="rounded-[22px] border border-[#D8E2EC] bg-[#F8FAFC] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">Status</p>
            <p className="mt-2 text-sm font-semibold text-[#1C8C7C]">
              {summary.isValid ? "Pronto para revisão" : "Aguardando preenchimento"}
            </p>
          </div>
        </div>

        <div
          className={cn(
            "rounded-[22px] border px-4 py-3 text-sm leading-6",
            summary.isValid
              ? "border-[#B8E4D2] bg-[#EAF9F3] text-[#166534]"
              : validationMessage
                ? "border-[#F3D08A] bg-[#FFF7E6] text-[#8A5A00]"
                : "border-[#B3C2D0] bg-[#EEF4F9] text-[#1F4E5F]"
          )}
        >
          <div className="flex items-start gap-2">
            {summary.isValid ? (
              <Clock3 className="mt-0.5 h-4 w-4" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4" />
            )}
            <p>
              {validationMessage ?? "Cada dia do período será registrado para aprovação."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeOffDateTimeFields;
