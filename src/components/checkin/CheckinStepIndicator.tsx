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
  const currentStep = STEPS.find((step) => step.id === current);

  if (!currentStep || currentIndex < 0) {
    return null;
  }

  return (
    <div className="flex justify-center" aria-label="Etapa atual do registro de ponto">
      <div className="inline-flex items-center gap-2 rounded-full border border-[#D8E3F5] bg-white px-3 py-1.5 shadow-sm">
        <span
          aria-hidden="true"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#2563EB] bg-[#2563EB] text-[10px] font-bold text-white sm:h-7 sm:w-7 sm:text-[11px]"
        >
          {currentIndex + 1}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#0F172A] sm:text-[11px]">
          {currentStep.label}
        </span>
      </div>
    </div>
  );
};

export default CheckinStepIndicator;
