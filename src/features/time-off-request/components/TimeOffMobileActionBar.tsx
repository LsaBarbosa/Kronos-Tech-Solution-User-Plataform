import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TimeOffRequestStep } from "../types";

interface TimeOffMobileActionBarProps {
  activeStep: TimeOffRequestStep;
  canAdvance: boolean;
  canSubmit: boolean;
  isSubmitting: boolean;
  hasSuccess: boolean;
  periodLabel: string;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
  onReset: () => void;
}

const TimeOffMobileActionBar = ({
  activeStep,
  canAdvance,
  canSubmit,
  isSubmitting,
  hasSuccess,
  periodLabel,
  onPrimaryAction,
  onSecondaryAction,
  onReset,
}: TimeOffMobileActionBarProps) => {
  const primaryLabel =
    hasSuccess ? "Nova solicitação" : activeStep === "review" ? "Enviar solicitação" : "Continuar";
  const secondaryLabel = activeStep === "type" ? "Limpar" : "Voltar";
  const primaryDisabled = hasSuccess ? false : activeStep === "review" ? !canSubmit || isSubmitting : !canAdvance;
  const secondaryAction = activeStep === "type" ? onReset : onSecondaryAction;
  const secondaryIcon = activeStep === "type" ? RotateCcw : ArrowLeft;
  const SecondaryIcon = secondaryIcon;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#D8E2EC] bg-white/96 backdrop-blur">
      <div className="mx-auto flex max-w-md gap-3 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3">
        <div className="min-w-0 flex-1 rounded-[18px] border border-[#D8E2EC] bg-[#F8FAFC] px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">Período</p>
          <p className="truncate text-sm font-semibold text-[#102A43]">{periodLabel}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-full border-[#D8E2EC] bg-white px-4 text-[#102A43]"
            onClick={secondaryAction}
          >
            <SecondaryIcon className="h-4 w-4" />
            {secondaryLabel}
          </Button>
          <Button
            type="button"
            className={cn(
              "h-12 rounded-full px-4 text-white",
              hasSuccess ? "bg-[#1C8C7C] hover:bg-[#166D61]" : "bg-[#1F4E5F] hover:bg-[#102A43]"
            )}
            onClick={hasSuccess ? onReset : onPrimaryAction}
            disabled={primaryDisabled}
          >
            {primaryLabel}
            {!hasSuccess ? <ArrowRight className="h-4 w-4" /> : null}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TimeOffMobileActionBar;
