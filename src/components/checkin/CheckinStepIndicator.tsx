import { cn } from "@/lib/utils";

export type CheckinStep = "location" | "camera" | "confirm" | "result" | "error";

interface CheckinStepIndicatorProps {
  current: CheckinStep;
}

const STEPS: { id: CheckinStep; label: string }[] = [
  { id: "location", label: "Localização" },
  { id: "camera", label: "Captura" },
  { id: "confirm", label: "Confirmação" },
];

const STEP_INDEX: Record<CheckinStep, number> = {
  location: 0,
  camera: 1,
  confirm: 2,
  result: 3,
  error: -1,
};

export const CheckinStepIndicator = ({ current }: CheckinStepIndicatorProps) => {
  const currentIndex = STEP_INDEX[current];
  return (
    <ol className="flex items-center gap-2" aria-label="Etapas do registro de ponto">
      {STEPS.map((step, index) => {
        const completed = currentIndex > index;
        const active = currentIndex === index;
        const dotClass = active
          ? "bg-[#2563EB] text-white border-[#2563EB]"
          : completed
            ? "bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]"
            : "bg-white text-[#94A3B8] border-[#E2E8F0]";
        const lineClass = completed ? "bg-[#BBF7D0]" : "bg-[#E2E8F0]";

        return (
          <li
            key={step.id}
            className="flex flex-1 items-center gap-2"
            aria-current={active ? "step" : undefined}
          >
            <span
              aria-hidden="true"
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold",
                dotClass
              )}
            >
              {index + 1}
            </span>
            <span
              className={cn(
                "truncate text-[11px] font-semibold uppercase tracking-[0.06em]",
                active
                  ? "text-[#0F172A]"
                  : completed
                    ? "text-[#15803D]"
                    : "text-[#94A3B8]"
              )}
            >
              {step.label}
            </span>
            {index < STEPS.length - 1 ? (
              <span aria-hidden="true" className={cn("ml-1 h-px flex-1", lineClass)} />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
};

export default CheckinStepIndicator;
