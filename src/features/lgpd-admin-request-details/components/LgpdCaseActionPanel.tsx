import { CheckCircle2, Download, MessageSquare, MoveRight, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { UseLgpdCaseDetailsReturn } from "../hooks/useLgpdCaseDetails";

interface LgpdCaseActionPanelProps {
  viewModel: UseLgpdCaseDetailsReturn;
  variant: "desktop" | "mobile";
}

const ActionRow = ({
  toneClass,
  title,
  description,
  hint,
  onClick,
  disabled,
  testId,
}: {
  toneClass: string;
  title: string;
  description: string;
  hint?: string;
  onClick: () => void;
  disabled?: boolean;
  testId?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    data-testid={testId}
    className={cn(
      "group flex w-full flex-col gap-1 rounded-2xl border p-4 text-left transition-colors disabled:opacity-60 disabled:cursor-not-allowed",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]",
      toneClass
    )}
  >
    <p className="text-sm font-semibold">{title}</p>
    <p className="text-xs leading-5">{description}</p>
    {hint ? (
      <p className="mt-1 inline-flex w-fit rounded-full border border-current/30 bg-white/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]">
        {hint}
      </p>
    ) : null}
  </button>
);

export const LgpdCaseActionPanel = ({ viewModel, variant }: LgpdCaseActionPanelProps) => {
  const {
    primaryAction,
    isClosed,
    isApprovedForExport,
    canShowCancelAction,
    availableAdvancedTransitions,
    handlePrimaryAction,
    handleOpenExportDialog,
    handleOpenCompletionDialog,
    showDialog,
    request,
    actionLoading,
    isExporting,
    hasExportedReviewedData,
  } = viewModel;

  if (!request) return null;

  const showWaitingDataSubjectAction = request.request.status === "WAITING_DATA_SUBJECT";

  return (
    <Card className="border border-[#E2E8F0] bg-white p-5 shadow-[0_10px_30px_rgba(11,18,32,0.08)]">
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#64748B]">
            Ações da controladora
          </p>
          {variant === "desktop" ? (
            <p className="text-lg font-semibold text-[#0F172A]">
              Próxima decisão e evidências obrigatórias.
            </p>
          ) : null}
        </div>

        {isApprovedForExport ? (
          <div className="space-y-2 rounded-2xl border border-[#BBF7D0] bg-[#DCFCE7] p-4">
            <p className="text-sm font-semibold text-[#15803D]">Exportação aprovada</p>
            <p className="text-xs text-[#15803D]">
              Gere o pacote revisado e, em seguida, conclua a solicitação.
            </p>
            {hasExportedReviewedData ? (
              <p className="text-xs text-[#15803D]">
                Exportação realizada nesta sessão — revise o arquivo antes de concluir.
              </p>
            ) : null}
          </div>
        ) : null}

        {!isClosed && primaryAction && !isApprovedForExport ? (
          <ActionRow
            toneClass="border-[#FCD34D] bg-[#FEF3C7] text-[#92400E] hover:bg-[#FDE68A]"
            title={primaryAction.label}
            description={primaryAction.description}
            hint={primaryAction.requiresJustification ? "exige justificativa" : undefined}
            onClick={() => void handlePrimaryAction()}
            disabled={actionLoading}
          />
        ) : null}

        {isApprovedForExport ? (
          <>
            <ActionRow
              toneClass="border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D] hover:bg-[#BBF7D0]"
              title="Exportar dados revisados"
              description="Libera pacote revisado do titular."
              onClick={handleOpenExportDialog}
              disabled={isExporting}
            />
            <ActionRow
              toneClass="border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D] hover:bg-[#BBF7D0]"
              title="Concluir solicitação"
              description="Encerra o caso após a exportação revisada."
              onClick={handleOpenCompletionDialog}
              disabled={actionLoading}
            />
          </>
        ) : null}

        {showWaitingDataSubjectAction ? (
          <ActionRow
            toneClass="border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#DBEAFE]"
            title="Solicitar complemento"
            description="Pede informação adicional ao titular."
            onClick={() => showDialog("complement")}
            disabled={actionLoading}
          />
        ) : null}

        {!isClosed ? (
          <ActionRow
            toneClass="border-[#FECACA] bg-[#FEE2E2] text-[#B91C1C] hover:bg-[#FECACA]"
            title="Rejeitar solicitação"
            description="Exige motivo e nota pública."
            onClick={() => showDialog("reject")}
            disabled={actionLoading}
          />
        ) : null}

        {!isClosed && availableAdvancedTransitions.length > 0 ? (
          <ActionRow
            toneClass="border-[#DDD6FE] bg-[#EDE9FE] text-[#5B21B6] hover:bg-[#DDD6FE]"
            title="Avançar manualmente"
            description="Uso técnico e controlado."
            onClick={() => showDialog("transition")}
            disabled={actionLoading}
          />
        ) : null}

        {canShowCancelAction ? (
          <ActionRow
            toneClass="border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F1F5F9]"
            title="Cancelar solicitação"
            description="Disponível apenas para CTO."
            onClick={() => showDialog("cancel")}
            disabled={actionLoading}
          />
        ) : null}

        {variant === "desktop" ? (
          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={viewModel.goBack}
              disabled={actionLoading}
              className="rounded-2xl border-[#E2E8F0] text-[#0F172A]"
            >
              Voltar
            </Button>
            {primaryAction ? (
              <Button
                type="button"
                onClick={() => void handlePrimaryAction()}
                disabled={actionLoading || isClosed}
                className="gap-2 rounded-2xl bg-[#2563EB] text-white shadow-[0_10px_24px_rgba(37,99,235,0.18)] hover:bg-[#1D4ED8]"
              >
                <MoveRight className="h-4 w-4" />
                Executar próxima ação
              </Button>
            ) : null}
          </div>
        ) : null}

        {/* Legend / icons hint */}
        <div className="hidden flex-wrap gap-2 pt-2 text-[10px] uppercase tracking-[0.06em] text-[#94A3B8] sm:flex">
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-[#16A34A]" /> aprovação
          </span>
          <span className="inline-flex items-center gap-1">
            <Download className="h-3 w-3 text-[#16A34A]" /> exportação
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="h-3 w-3 text-[#1D4ED8]" /> complemento
          </span>
          <span className="inline-flex items-center gap-1">
            <XCircle className="h-3 w-3 text-[#DC2626]" /> rejeição
          </span>
        </div>
      </div>
    </Card>
  );
};

export default LgpdCaseActionPanel;
