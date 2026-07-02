import { cn } from "@/lib/utils";
import { COLLABORATOR_DAY_OPTIONS } from "../constants";

const DAY_ORDER = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

interface CustomDaysMobileProps {
  value: string[];
  onChange: (days: string[]) => void;
}

export function CustomDaysMobile({ value, onChange }: CustomDaysMobileProps) {
  const count = value.length;

  const handleIncrease = () => {
    if (count >= 7) return;
    const next = DAY_ORDER.find((d) => !value.includes(d));
    if (next) onChange([...value, next]);
  };

  const handleDecrease = () => {
    if (count <= 1) return;
    const last = [...DAY_ORDER].reverse().find((d) => value.includes(d));
    if (last) onChange(value.filter((d) => d !== last));
  };

  const toggleDay = (day: string) => {
    const isSelected = value.includes(day);
    if (isSelected && value.length === 1) return;
    const next = isSelected
      ? value.filter((d) => d !== day)
      : [...value, day];
    onChange(next);
  };

  const offDays = COLLABORATOR_DAY_OPTIONS.filter(
    (d) => !value.includes(d.value)
  ).map((d) => d.label);

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">
          Dias por semana
        </p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleDecrease}
            disabled={count <= 1}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border text-lg font-semibold transition-all",
              count <= 1
                ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300"
                : "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"
            )}
          >
            −
          </button>
          <span className="w-6 text-center text-2xl font-semibold text-slate-900">
            {count}
          </span>
          <button
            type="button"
            onClick={handleIncrease}
            disabled={count >= 7}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border text-lg font-semibold transition-all",
              count >= 7
                ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300"
                : "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"
            )}
          >
            +
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Quais dias?</p>
        <div className="flex flex-wrap gap-2">
          {COLLABORATOR_DAY_OPTIONS.map((day) => {
            const isSelected = value.includes(day.value);
            const isOnlyOne = isSelected && value.length === 1;

            return (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                disabled={isOnlyOne}
                className={cn(
                  "rounded-full border px-3 py-2 text-sm font-semibold transition-all",
                  isSelected
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-500",
                  isOnlyOne && "opacity-50"
                )}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-slate-500">
        {offDays.length === 0
          ? "Trabalha todos os dias da semana"
          : `Folgas automáticas: ${offDays.join(", ")}`}
      </p>
    </div>
  );
}
