import { CheckCircle2, ClipboardList, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import VacationDateRangeSummary from "./VacationDateRangeSummary";
import type { VacationPeriodSummary } from "../types";

interface MobileReviewStepProps {
  summary: VacationPeriodSummary;
  startLabel?: string;
  endLabel?: string;
  managerLabel?: string;
  validationMessage?: string;
  successCreatedIds?: number[];
}

const MobileReviewStep = ({
  summary,
  startLabel,
  endLabel,
  managerLabel,
  validationMessage,
  successCreatedIds,
}: MobileReviewStepProps) => {
  const hasSuccess = Boolean(successCreatedIds?.length);

  return (
    <Card className="rounded-[28px] border border-[#E2E8F0] bg-white shadow-[0_16px_40px_rgba(16,26,51,0.08)]">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-[#BFDBFE] bg-[#EFF6FF] text-[#1E3A8A]">
            <ClipboardList className="mr-1 h-3.5 w-3.5" />
            Passo 3
          </Badge>
        </div>
        <CardTitle className="text-2xl text-[#0F172A]">Revisão rápida</CardTitle>
        <CardDescription className="text-[#64748B]">Confira tudo antes de enviar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasSuccess ? (
          <div className="rounded-[22px] border border-[#B7E4C7] bg-[#DCFCE7] p-4 text-sm leading-6 text-[#166534]">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4" />
              <p>
                Solicitação enviada para análise. {successCreatedIds.length} dias registrados para aprovação.
              </p>
            </div>
          </div>
        ) : null}

        <VacationDateRangeSummary
          summary={summary}
          startLabel={startLabel}
          endLabel={endLabel}
          managerLabel={managerLabel}
          statusLabel={hasSuccess ? "Solicitação enviada" : "Aguardará aprovação"}
          statusTone={hasSuccess ? "success" : summary.isValid ? "warning" : "info"}
          helperMessage={
            validationMessage ??
            "O pedido seguirá para aprovação do manager selecionado e cada dia será registrado."
          }
        />

        <div className="rounded-[22px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 text-[#1E3A8A]" />
            <p className="text-sm leading-6 text-[#64748B]">
              Após o envio, a solicitação ficará aguardando análise do manager responsável.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileReviewStep;

