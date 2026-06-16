import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UseLgpdCaseDetailsReturn } from "../hooks/useLgpdCaseDetails";
import { isSensitiveType } from "../utils/lgpdCaseFormatters";

interface LgpdCaseMobileDecisionBarProps {
  viewModel: UseLgpdCaseDetailsReturn;
}

export const LgpdCaseMobileDecisionBar = ({ viewModel }: LgpdCaseMobileDecisionBarProps) => {
  const {
    request,
    primaryAction,
    isClosed,
    isApprovedForExport,
    handlePrimaryAction,
    handleOpenExportDialog,
    actionLoading,
    isExporting,
    goBack,
  } = viewModel;

  if (!request) return null;

  const sensitive = isSensitiveType(request.request.requestType);
  const requiresJustification = primaryAction?.requiresJustification ?? false;
  const ctaLabel = isApprovedForExport ? "Exportar dados" : primaryAction?.label ?? "Voltar";
  const onCtaClick = isApprovedForExport
    ? handleOpenExportDialog
    : primaryAction
      ? () => void handlePrimaryAction()
      : goBack;

  return (
    <div className="sticky bottom-4 z-30 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-[0_18px_50px_rgba(11,18,32,0.18)]">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
          Próxima decisão
        </p>
        <p className="text-sm text-[#334155]">
          {isClosed
            ? "Caso encerrado — leitura disponível para auditoria."
            : primaryAction?.hint ?? "Avalie próximas decisões disponíveis."}
        </p>
        <div className="flex flex-wrap gap-2">
          {requiresJustification ? (
            <Badge
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em]",
                "border-[#FCD34D] bg-[#FEF3C7] text-[#92400E]"
              )}
            >
              revisão legal
            </Badge>
          ) : null}
          {sensitive ? (
            <Badge
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em]",
                "border-[#DDD6FE] bg-[#EDE9FE] text-[#5B21B6]"
              )}
            >
              dados sensíveis
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={goBack}
          disabled={actionLoading}
          className="h-11 flex-1 gap-2 rounded-2xl border-[#E2E8F0] text-[#0F172A]"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Button
          type="button"
          onClick={onCtaClick}
          disabled={actionLoading || isExporting || (isClosed && !primaryAction)}
          className="h-11 flex-[2] gap-2 rounded-2xl bg-[#2563EB] text-white shadow-[0_10px_24px_rgba(37,99,235,0.18)] hover:bg-[#1D4ED8] disabled:opacity-60"
        >
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
};

export default LgpdCaseMobileDecisionBar;
