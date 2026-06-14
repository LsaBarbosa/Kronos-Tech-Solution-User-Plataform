import { ArrowRight, CalendarCheck2, CheckCircle2, FileCheck2, FileText, Loader2, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { mapManagerOptionToDisplay } from "../mappers/time-off-request.mapper";
import { formatTimeOffDurationLabel } from "../utils/timeOffFormatting";
import type { TimeOffRequestFileSummary, TimeOffRequestPeriodSummary } from "../types";
import type { ManagerOption } from "@/types/vacation";

interface TimeOffApprovalSummaryProps {
  periodSummary: TimeOffRequestPeriodSummary;
  requestTypeLabel: string;
  manager?: ManagerOption;
  documentSummary?: TimeOffRequestFileSummary;
  validationMessage?: string;
  submitErrorMessage?: string;
  successTimeRecordId?: number;
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
  onReset: () => void;
  showActions?: boolean;
  variant?: "desktop" | "mobile";
  className?: string;
}

const TimeOffApprovalSummary = ({
  periodSummary,
  requestTypeLabel,
  manager,
  documentSummary,
  validationMessage,
  submitErrorMessage,
  successTimeRecordId,
  canSubmit,
  isSubmitting,
  onSubmit,
  onReset,
  showActions = true,
  variant = "desktop",
  className,
}: TimeOffApprovalSummaryProps) => {
  const isMobile = variant === "mobile";
  const managerDisplay = manager ? mapManagerOptionToDisplay(manager) : undefined;
  const isSuccess = Boolean(successTimeRecordId);
  const primaryActionLabel = isSuccess ? "Nova solicitação" : isSubmitting ? "Enviando..." : "Enviar solicitação";
  const primaryAction = isSuccess ? onReset : onSubmit;
  const primaryDisabled = !isSuccess && (!canSubmit || isSubmitting);

  return (
    <Card className={cn("rounded-[28px] border border-[#D8E2EC] bg-white shadow-[0_16px_40px_rgba(16,42,67,0.10)]", className)}>
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-[#B3C2D0] bg-[#E9EEF4] text-[#102A43]">
            <CalendarCheck2 className="mr-1 h-3.5 w-3.5" />
            Resumo para aprovação
          </Badge>
        </div>
        <CardTitle className={cn("text-[#102A43]", isMobile ? "text-xl" : "text-2xl")}>Composição da solicitação</CardTitle>
        <CardDescription className="text-[#627D98]">
          Revise os dados antes de enviar para o manager responsável.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isSuccess ? (
          <div className="rounded-[22px] border border-[#B8E4D2] bg-[#EAF9F3] px-4 py-3 text-sm leading-6 text-[#166534]">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4" />
              <p>
                Solicitação enviada para análise.
                {successTimeRecordId ? ` Protocolo ${successTimeRecordId}.` : ""} Cada dia do período será registrado para aprovação.
              </p>
            </div>
          </div>
        ) : null}

        {submitErrorMessage ? (
          <div className="rounded-[22px] border border-[#F3D08A] bg-[#FFF7E6] px-4 py-3 text-sm leading-6 text-[#8A5A00]">
            <div className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 h-4 w-4" />
              <p>{submitErrorMessage}</p>
            </div>
          </div>
        ) : null}

        {validationMessage && !isSuccess ? (
          <div className="rounded-[22px] border border-[#B3C2D0] bg-[#EEF4F9] px-4 py-3 text-sm leading-6 text-[#1F4E5F]">
            <div className="flex items-start gap-2">
              <FileCheck2 className="mt-0.5 h-4 w-4" />
              <p>{validationMessage}</p>
            </div>
          </div>
        ) : null}

        <div className="space-y-3 rounded-[24px] border border-[#D8E2EC] bg-[#F8FAFC] p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Tipo" value={requestTypeLabel} />
            <Field label="Status esperado" value="Pendente de aprovação" />
            <Field label="Início" value={periodSummary.startLabel} />
            <Field label="Fim" value={periodSummary.endLabel} />
            <Field label="Dias corridos" value={String(periodSummary.dayCount)} />
            <Field label="Duração" value={formatTimeOffDurationLabel(periodSummary)} />
          </div>

          <Separator className="bg-[#D8E2EC]" />

          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">Manager responsável</p>
              <p className="mt-1 text-sm font-semibold text-[#102A43]">
                {managerDisplay?.displayName ?? "Selecione um gestor"}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">Período solicitado</p>
              <p className="mt-1 text-sm text-[#102A43]">
                {periodSummary.periodLabel}
              </p>
              <p className="mt-1 text-sm text-[#627D98]">{periodSummary.timeLabel}</p>
            </div>

            {documentSummary ? (
              <div className="rounded-[20px] border border-[#D8E2EC] bg-white p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">Evidência</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#102A43]">{documentSummary.name}</p>
                    <p className="text-sm text-[#627D98]">
                      {documentSummary.typeLabel} • {documentSummary.sizeLabel}
                    </p>
                  </div>
                  <Badge variant="outline" className="border-[#B8E4D2] bg-[#EAF9F3] text-[#166534]">
                    {documentSummary.statusLabel}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="rounded-[20px] border border-dashed border-[#D8E2EC] bg-white p-3 text-sm text-[#627D98]">
                Anexo opcional não informado.
              </div>
            )}
          </div>
        </div>

        {showActions ? (
          <div className={cn("grid gap-3", isMobile ? "grid-cols-1" : "sm:grid-cols-[minmax(0,1fr),auto]")}>
            <Button
              type="button"
              className="h-12 rounded-full bg-[#1F4E5F] px-6 text-white hover:bg-[#102A43]"
              onClick={primaryAction}
              disabled={primaryDisabled}
            >
              {isSubmitting && !isSuccess ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {primaryActionLabel}
              {!isSuccess ? <ArrowRight className="h-4 w-4" /> : null}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-full border-[#D8E2EC] bg-white px-6 text-[#102A43]"
              onClick={onReset}
            >
              Limpar formulário
            </Button>
          </div>
        ) : null}

        <div className="rounded-[22px] border border-[#D8E2EC] bg-[#F8FAFC] px-4 py-3 text-sm leading-6 text-[#627D98]">
          <div className="flex items-start gap-2">
            <FileText className="mt-0.5 h-4 w-4 text-[#635BFF]" />
            <p>Cada dia do período será registrado para aprovação no fluxo gerencial.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-[18px] border border-[#D8E2EC] bg-white p-3">
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">{label}</p>
    <p className="mt-1 text-sm font-semibold text-[#102A43]">{value}</p>
  </div>
);

export default TimeOffApprovalSummary;
