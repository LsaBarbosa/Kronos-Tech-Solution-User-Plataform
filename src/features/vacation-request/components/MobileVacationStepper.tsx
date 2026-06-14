import { cn } from "@/lib/utils";
import type { VacationRequestStep } from "../types";

interface MobileVacationStepperProps {
  value: VacationRequestStep;
  onChange: (step: VacationRequestStep) => void;
}

const steps: Array<{ value: VacationRequestStep; label: string; order: number }> = [
  { value: "period", label: "Período", order: 1 },
  { value: "manager", label: "Manager", order: 2 },
  { value: "review", label: "Revisão", order: 3 },
];

const MobileVacationStepper = ({ value, onChange }: MobileVacationStepperProps) => {
  return (
    <div className="rounded-[24px] border border-[#E2E8F0] bg-white p-3 shadow-[0_14px_36px_rgba(16,26,51,0.08)]">
      <div className="grid grid-cols-3 gap-2">
        {steps.map((step) => {
          const active = step.value === value;

          return (
            <button
              key={step.value}
              type="button"
              onClick={() => onChange(step.value)}
              className={cn(
                "flex min-h-16 flex-col items-center justify-center rounded-[18px] border px-2 py-2 text-center transition-colors",
                active
                  ? "border-[#2563EB] bg-[#EFF6FF] text-[#1E3A8A]"
                  : "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]"
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                  active ? "bg-[#2563EB] text-white" : "bg-white text-[#64748B]"
                )}
              >
                {step.order}
              </span>
              <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileVacationStepper;

