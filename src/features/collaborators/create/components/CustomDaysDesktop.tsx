import { cn } from "@/lib/utils";
import { COLLABORATOR_DAY_OPTIONS } from "../constants";

interface CustomDaysDesktopProps {
  value: string[];
  onChange: (days: string[]) => void;
}

export function CustomDaysDesktop({ value, onChange }: CustomDaysDesktopProps) {
  const toggle = (day: string) => {
    const isSelected = value.includes(day);
    if (isSelected && value.length === 1) return;
    const next = isSelected
      ? value.filter((d) => d !== day)
      : [...value, day];
    onChange(next);
  };

  const workedDays = value.length;
  const offDays = 7 - workedDays;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {COLLABORATOR_DAY_OPTIONS.map((day) => {
          const isSelected = value.includes(day.value);
          const isOnlyOne = isSelected && value.length === 1;

          return (
            <button
              key={day.value}
              type="button"
              onClick={() => toggle(day.value)}
              disabled={isOnlyOne}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                isSelected
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/60",
                isOnlyOne && "cursor-not-allowed opacity-50"
              )}
            >
              {day.label}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-slate-500">
        {workedDays} {workedDays === 1 ? "dia trabalhado" : "dias trabalhados"} ·{" "}
        {offDays} {offDays === 1 ? "folga" : "folgas"}
      </p>
    </div>
  );
}
