import { BadgeCheck, FileUp, ListChecks, Users, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TimeOffRequestStep } from "../types";

interface TimeOffMobileStepperProps {
  value: TimeOffRequestStep;
  onChange: (step: TimeOffRequestStep) => void;
}

const steps: Array<{ value: TimeOffRequestStep; label: string; icon: typeof BadgeCheck }> = [
  { value: "type", label: "Tipo", icon: BadgeCheck },
  { value: "period", label: "Período", icon: Workflow },
  { value: "manager", label: "Gestor", icon: Users },
  { value: "evidence", label: "Evidência", icon: FileUp },
  { value: "review", label: "Revisão", icon: ListChecks },
];

const TimeOffMobileStepper = ({ value, onChange }: TimeOffMobileStepperProps) => {
  return (
    <div className="overflow-x-auto rounded-[24px] border border-[#D8E2EC] bg-white p-3 shadow-[0_14px_36px_rgba(16,42,67,0.08)]">
      <div className="grid min-w-[640px] grid-cols-5 gap-2">
        {steps.map((step, index) => {
          const active = step.value === value;
          const Icon = step.icon;

          return (
            <button
              key={step.value}
              type="button"
              onClick={() => onChange(step.value)}
              className={cn(
                "flex min-h-16 flex-col items-center justify-center rounded-[18px] border px-3 py-2 text-center transition-colors",
                active
                  ? "border-[#22B8CF] bg-[#EEF7FB] text-[#102A43]"
                  : "border-[#D8E2EC] bg-[#F8FAFC] text-[#627D98]"
              )}
            >
              <span className={cn("flex h-8 w-8 items-center justify-center rounded-full", active ? "bg-[#1F4E5F] text-white" : "bg-white text-[#627D98]")}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
                {index + 1}. {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TimeOffMobileStepper;
