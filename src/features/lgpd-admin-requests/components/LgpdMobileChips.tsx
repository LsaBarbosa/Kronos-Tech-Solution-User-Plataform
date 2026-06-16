import { cn } from "@/lib/utils";
import type { MobileStatusChip } from "../hooks/useLgpdAdminRequestsViewModel";

interface LgpdMobileChipsProps {
  value: MobileStatusChip;
  onChange: (value: MobileStatusChip) => void;
}

const CHIPS: { value: MobileStatusChip; label: string; activeTone: string; inactiveTone: string }[] = [
  {
    value: "open",
    label: "Abertas",
    activeTone: "bg-[#2563EB] text-white shadow-[0_8px_20px_rgba(37,99,235,0.25)]",
    inactiveTone: "border border-[#E2E8F0] bg-white text-[#1D4ED8]",
  },
  {
    value: "in_analysis",
    label: "Em análise",
    activeTone: "bg-[#1E3A8A] text-white shadow-[0_8px_20px_rgba(30,58,138,0.25)]",
    inactiveTone: "border border-[#E2E8F0] bg-white text-[#1E3A8A]",
  },
  {
    value: "overdue",
    label: "Atrasadas",
    activeTone: "bg-[#DC2626] text-white shadow-[0_8px_20px_rgba(220,38,38,0.25)]",
    inactiveTone: "border border-[#FECACA] bg-[#FEE2E2] text-[#B91C1C]",
  },
];

export const LgpdMobileChips = ({ value, onChange }: LgpdMobileChipsProps) => {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtro rápido por status">
      <button
        type="button"
        role="tab"
        aria-selected={value === "all"}
        onClick={() => onChange("all")}
        className={cn(
          "rounded-full px-4 py-2 text-xs font-semibold transition-colors",
          value === "all"
            ? "bg-[#0F172A] text-white"
            : "border border-[#E2E8F0] bg-white text-[#0F172A]"
        )}
      >
        Todas
      </button>
      {CHIPS.map((chip) => (
        <button
          key={chip.value}
          type="button"
          role="tab"
          aria-selected={value === chip.value}
          onClick={() => onChange(chip.value)}
          className={cn(
            "rounded-full px-4 py-2 text-xs font-semibold transition-colors",
            value === chip.value ? chip.activeTone : chip.inactiveTone
          )}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
};

export default LgpdMobileChips;
