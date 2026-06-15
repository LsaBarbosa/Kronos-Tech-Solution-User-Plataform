import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Clock3, CheckCircle2, CircleAlert, Filter } from "lucide-react";
import { ReportStatusChips } from "@/components/relatorio-detalhado/ReportStatusChips";
import { isValidReferenceTime } from "@/components/relatorio-detalhado/report-ui.helpers";

type ReportReferenceStatusCardProps = {
  referenceTime: string;
  onReferenceTimeChange: (value: string) => void;
  reportActive: boolean;
  onReportActiveChange: (value: boolean) => void;
  selectedStatuses: string[];
  onToggleStatus: (status: string) => void;
  onClearStatuses: () => void;
  compact?: boolean;
};

export const ReportReferenceStatusCard = ({
  referenceTime,
  onReferenceTimeChange,
  reportActive,
  onReportActiveChange,
  selectedStatuses,
  onToggleStatus,
  onClearStatuses,
  compact = false,
}: ReportReferenceStatusCardProps) => {
  const isValid = isValidReferenceTime(referenceTime);

  return (
    <Card className="border border-[#D8E2EC] bg-white shadow-[0_10px_30px_rgba(16,42,67,0.08)]">
      <CardHeader className="space-y-2 border-b border-[#D8E2EC] pb-4">
        <CardTitle className="flex items-center gap-2 text-base text-[#102A43]">
          <Clock3 className="h-4 w-4 text-[#1F4E5F]" />
          Referência e status
        </CardTitle>
        <p className="text-sm leading-6 text-[#627D98]">
          O campo <span className="font-semibold text-[#102A43]">reference</span> segue o formato HH:mm e o estado <span className="font-semibold text-[#102A43]">active</span> continua no payload.
        </p>
      </CardHeader>

      <CardContent className="space-y-5 p-4">
        <div className={cn("grid gap-4", compact ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-[180px_minmax(0,1fr)]")}>
          <div className="space-y-2">
            <Label htmlFor="reference-time" className="text-sm font-semibold text-[#102A43]">
              Carga horária
            </Label>
            <Input
              id="reference-time"
              type="time"
              value={referenceTime}
              onChange={(event) => onReferenceTimeChange(event.target.value)}
              className={cn(
                "h-11 rounded-2xl border-[#D8E2EC] bg-[#F5F8FB] text-[#102A43] focus:border-[#1F4E5F] focus:ring-[#1F4E5F]/20",
                !isValid && referenceTime ? "border-[#D64545]" : ""
              )}
            />
            <p className={cn("text-xs", isValid ? "text-[#627D98]" : "text-[#D64545]")}>
              Use HH:mm. Exemplo: 08:00.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#102A43]">
              Situação do registro
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onReportActiveChange(true)}
                className={cn(
                  "h-11 rounded-2xl border px-3 text-sm font-semibold",
                  reportActive
                    ? "border-[#1C8C7C] bg-[#E6FFFB] text-[#166E64]"
                    : "border-[#D8E2EC] bg-white text-[#627D98] hover:bg-[#F5F8FB]"
                )}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Aprovado
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onReportActiveChange(false)}
                className={cn(
                  "h-11 rounded-2xl border px-3 text-sm font-semibold",
                  !reportActive
                    ? "border-[#D64545] bg-[#FFF1F1] text-[#B42318]"
                    : "border-[#D8E2EC] bg-white text-[#627D98] hover:bg-[#F5F8FB]"
                )}
              >
                <CircleAlert className="mr-2 h-4 w-4" />
                Reprovado
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#D8E2EC] bg-[#F5F8FB] p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#102A43]">Filtros de status</p>
              <p className="text-xs text-[#627D98]">Seleção múltipla e opcional.</p>
            </div>
            <Badge className="rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-semibold text-[#1D4ED8]">
              <Filter className="mr-1 h-3.5 w-3.5" />
              {selectedStatuses.length} selecionado(s)
            </Badge>
          </div>
          <ReportStatusChips
            selectedStatuses={selectedStatuses}
            onToggleStatus={onToggleStatus}
            onClearStatuses={onClearStatuses}
            compact={compact}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportReferenceStatusCard;
