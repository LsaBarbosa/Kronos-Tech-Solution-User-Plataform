import { AlertTriangle, BadgeCheck, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { TIME_OFF_TYPE_OPTIONS } from "../mappers/time-off-request.mapper";
import { formatTimeOffTypeDescription, formatTimeOffTypeLabel } from "../utils/timeOffFormatting";
import type { TimeOffRequestType } from "../types";

interface TimeOffTypeSelectorProps {
  value: TimeOffRequestType | "";
  onChange: (type: TimeOffRequestType) => void;
  validationMessage?: string;
  variant?: "desktop" | "mobile";
  className?: string;
}

const TimeOffTypeSelector = ({
  value,
  onChange,
  validationMessage,
  variant = "desktop",
  className,
}: TimeOffTypeSelectorProps) => {
  const isMobile = variant === "mobile";

  return (
    <Card className={cn("rounded-[28px] border border-[#D8E2EC] bg-white shadow-[0_16px_40px_rgba(16,42,67,0.10)]", className)}>
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-[#B3C2D0] bg-[#E9EEF4] text-[#102A43]">
            <ClipboardList className="mr-1 h-3.5 w-3.5" />
            Tipo
          </Badge>
        </div>
        <CardTitle className={cn("text-[#102A43]", isMobile ? "text-xl" : "text-2xl")}>Escolha a justificativa</CardTitle>
        <CardDescription className="text-[#627D98]">
          Abono de horas ou esquecimento de ponto. Cada opção segue a mesma validação gerencial.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={value}
          onValueChange={(next) => onChange(next as TimeOffRequestType)}
          className={cn("grid gap-3", isMobile ? "grid-cols-1" : "sm:grid-cols-2")}
        >
          {TIME_OFF_TYPE_OPTIONS.map((option) => {
            const active = option.value === value;

            return (
                  <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer gap-3 rounded-[24px] border p-4 transition-colors",
                  active
                    ? "border-[#22B8CF] bg-[#EEF7FB] shadow-[0_12px_28px_rgba(34,184,207,0.10)]"
                    : "border-[#D8E2EC] bg-[#F8FAFC] hover:border-[#B3C2D0] hover:bg-[#F3F7FA]"
                )}
              >
                <RadioGroupItem value={option.value} className="mt-1" />
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-[#102A43]">{option.label}</p>
                  <p className="mt-1 text-sm leading-6 text-[#627D98]">
                    {option.description ?? formatTimeOffTypeDescription(option.value)}
                  </p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-[#635BFF]">
                    {formatTimeOffTypeLabel(option.value)}
                  </p>
                </div>
              </label>
            );
          })}
        </RadioGroup>

        {validationMessage ? (
          <div className="rounded-[22px] border border-[#F3D08A] bg-[#FFF7E6] px-4 py-3 text-sm leading-6 text-[#8A5A00]">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4" />
              <p>{validationMessage}</p>
            </div>
          </div>
        ) : null}

        <div className="rounded-[22px] border border-[#D8E2EC] bg-[#F8FAFC] px-4 py-3 text-sm leading-6 text-[#627D98]">
          <div className="flex items-start gap-2">
            <BadgeCheck className="mt-0.5 h-4 w-4 text-[#1C8C7C]" />
            <p>
              O gestor receberá a solicitação com o período, horários e evidência opcional, se houver.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeOffTypeSelector;
