import { ArrowRight, CheckCircle2, Clock3, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { VacationPeriodSummary } from "../types";
import VacationDateRangeSummary from "./VacationDateRangeSummary";
import VacationRulesCard from "./VacationRulesCard";

interface VacationReviewPanelProps {
  summary: VacationPeriodSummary;
  startLabel?: string;
  endLabel?: string;
  managerLabel?: string;
  isSubmitting: boolean;
  canSubmit: boolean;
  validationMessage?: string;
  successCreatedIds?: number[];
  onSubmit: () => void;
  onScrollToRules?: () => void;
  className?: string;
}

const timelineItems = [
  {
    title: "Solicitação criada",
    description: "O pedido entra na fila de aprovação com os dias do período registrados.",
  },
  {
    title: "Manager analisa",
    description: "O responsável selecionado recebe a solicitação para aprovar ou rejeitar.",
  },
  {
    title: "Resultado atualizado",
    description: "O status volta para a sua área após a análise do gestor.",
  },
] as const;

const VacationReviewPanel = ({
  summary,
  startLabel,
  endLabel,
  managerLabel,
  isSubmitting,
  canSubmit,
  validationMessage,
  successCreatedIds,
  onSubmit,
  onScrollToRules,
  className,
}: VacationReviewPanelProps) => {
  const hasSuccess = Boolean(successCreatedIds?.length);

  return (
    <Card className={className}>
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-[#BFDBFE] bg-[#EFF6FF] text-[#1E3A8A]">
            <Clock3 className="mr-1 h-3.5 w-3.5" />
            Revisão
          </Badge>
        </div>
        <CardTitle className="text-2xl text-[#0F172A]">Resumo da solicitação</CardTitle>
        <CardDescription className="text-[#64748B]">Conferência antes do envio.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
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
          statusLabel={hasSuccess ? "Solicitação enviada para análise" : "Aguardará aprovação"}
          statusTone={hasSuccess ? "success" : summary.isValid ? "warning" : "info"}
          helperMessage={
            validationMessage ??
            (hasSuccess
              ? "O pedido está em análise e cada dia do período foi registrado para aprovação."
              : "Cada dia do período será registrado para aprovação.")
          }
        />

        <div className="space-y-3 rounded-[28px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-[#1E3A8A]" />
            <p className="text-sm font-semibold text-[#0F172A]">Fluxo após envio</p>
          </div>
          <div className="space-y-4">
            {timelineItems.map((item, index) => (
              <div key={item.title} className="flex gap-3">
                <div className="relative flex flex-col items-center">
                  <div
                    className={
                      index === 0 && hasSuccess
                        ? "flex h-8 w-8 items-center justify-center rounded-full bg-[#16A34A] text-sm font-semibold text-white"
                        : index === 0
                          ? "flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB] text-sm font-semibold text-white"
                          : "flex h-8 w-8 items-center justify-center rounded-full border border-[#BFDBFE] bg-[#EFF6FF] text-sm font-semibold text-[#1E3A8A]"
                    }
                  >
                    {index + 1}
                  </div>
                  {index < timelineItems.length - 1 ? (
                    <div className="h-full w-px bg-[#E2E8F0]" />
                  ) : null}
                </div>
                <div className="min-w-0 pb-1">
                  <p className="text-sm font-semibold text-[#0F172A]">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-[#64748B]">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <VacationRulesCard />

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr),auto]">
          <Button
            type="button"
            className="h-12 rounded-full bg-[#2563EB] px-6 text-white hover:bg-[#1E3A8A]"
            onClick={onSubmit}
            disabled={!canSubmit || isSubmitting || hasSuccess}
          >
            {hasSuccess ? "Solicitação enviada" : isSubmitting ? "Enviando..." : "Enviar solicitação"}
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-full border-[#E2E8F0] bg-white px-6 text-[#0F172A] hover:border-[#BFDBFE] hover:text-[#1E3A8A]"
            onClick={onScrollToRules}
          >
            Ver regras
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VacationReviewPanel;

