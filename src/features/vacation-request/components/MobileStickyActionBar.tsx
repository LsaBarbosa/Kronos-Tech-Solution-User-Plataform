import { ArrowRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VacationRequestStep } from "../types";

interface MobileStickyActionBarProps {
  activeStep: VacationRequestStep;
  periodLabel: string;
  canAdvance: boolean;
  canSubmit: boolean;
  isSubmitting: boolean;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
  onReset?: () => void;
  hasSuccess?: boolean;
}

const labels: Record<VacationRequestStep, string> = {
  period: "Continuar",
  manager: "Revisar",
  review: "Solicitar férias",
};

const MobileStickyActionBar = ({
  activeStep,
  periodLabel,
  canAdvance,
  canSubmit,
  isSubmitting,
  onPrimaryAction,
  onSecondaryAction,
  onReset,
  hasSuccess = false,
}: MobileStickyActionBarProps) => {
  const primaryDisabled =
    activeStep === "period" ? !canAdvance : activeStep === "manager" ? !canAdvance : !canSubmit || isSubmitting || hasSuccess;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E2E8F0] bg-white/96 backdrop-blur-xl">
      <div className="mx-auto max-w-md px-4 pb-[max(0.9rem,env(safe-area-inset-bottom))] pt-3">
        <div className="mb-3 rounded-[20px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">Resumo</p>
          <p className="mt-1 text-sm font-semibold text-[#0F172A]">
            {periodLabel || "Selecione o período solicitado"}
          </p>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr),auto] gap-3">
          {activeStep === "period" ? (
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-full border-[#E2E8F0] bg-white px-4 text-[#0F172A]"
              onClick={onReset ?? onSecondaryAction}
            >
              Limpar
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-full border-[#E2E8F0] bg-white px-4 text-[#0F172A]"
              onClick={onSecondaryAction}
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Button>
          )}

          <Button
            type="button"
            className={cn("h-12 rounded-full bg-[#2563EB] px-5 text-white hover:bg-[#1E3A8A]")}
            onClick={onPrimaryAction}
            disabled={primaryDisabled}
          >
            {activeStep === "review" && isSubmitting ? "Enviando..." : labels[activeStep]}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileStickyActionBar;

