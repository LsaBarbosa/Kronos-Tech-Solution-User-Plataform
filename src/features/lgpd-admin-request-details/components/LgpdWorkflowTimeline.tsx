import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { WorkflowStep } from "../utils/lgpdCaseFormatters";

interface LgpdWorkflowTimelineProps {
  steps: WorkflowStep[];
  variant: "desktop" | "mobile";
  currentLabel?: string;
}

export const LgpdWorkflowTimeline = ({
  steps,
  variant,
  currentLabel,
}: LgpdWorkflowTimelineProps) => {
  return (
    <Card className="border border-[#E2E8F0] bg-white p-5 shadow-[0_10px_30px_rgba(11,18,32,0.06)]">
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">
            {variant === "mobile" ? "Fluxo" : "Fluxo da solicitação"}
          </p>
          {variant === "desktop" ? (
            <p className="text-lg font-semibold text-[#0F172A]">Linha do tempo do tratamento</p>
          ) : null}
        </div>

        {variant === "desktop" ? (
          <div className="relative flex items-start justify-between gap-2 pt-2">
            <div
              aria-hidden="true"
              className="absolute left-4 right-4 top-5 h-px bg-[#E2E8F0]"
            />
            {steps.map((step, index) => {
              const dotClass = step.current
                ? "bg-[#F59E0B] text-white border-[#F59E0B]"
                : step.completed
                  ? "bg-[#16A34A] text-white border-[#16A34A]"
                  : "bg-white text-[#94A3B8] border-[#E2E8F0]";
              return (
                <div
                  key={step.label}
                  className="relative z-10 flex min-w-0 flex-1 flex-col items-center gap-1"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold",
                      dotClass
                    )}
                  >
                    {index + 1}
                  </span>
                  <span
                    className={cn(
                      "text-center text-[11px] uppercase tracking-[0.06em]",
                      step.current ? "font-semibold text-[#0F172A]" : "text-[#64748B]"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-1">
              {steps.map((step, index) => {
                const dotClass = step.current
                  ? "bg-[#F59E0B] text-white"
                  : step.completed
                    ? "bg-[#16A34A] text-white"
                    : "bg-[#E2E8F0] text-[#94A3B8]";
                return (
                  <div key={step.label} className="flex flex-col items-center gap-1">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                        dotClass
                      )}
                    >
                      {index + 1}
                    </span>
                  </div>
                );
              })}
            </div>
            {currentLabel ? (
              <p className="text-xs text-[#64748B]">Atual: {currentLabel}</p>
            ) : null}
          </div>
        )}
      </div>
    </Card>
  );
};

export default LgpdWorkflowTimeline;
