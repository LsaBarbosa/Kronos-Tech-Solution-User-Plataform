import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FiscalReportDescriptor } from "../utils/fiscal-helpers";

interface FiscalReportCardProps {
  descriptor: FiscalReportDescriptor;
  selected: boolean;
  onSelect: () => void;
  variant?: "desktop" | "mobile";
}

const FiscalReportCard = ({
  descriptor,
  selected,
  onSelect,
  variant = "desktop",
}: FiscalReportCardProps) => {
  const Icon = descriptor.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`Selecionar ${descriptor.shortLabel}`}
      className={cn(
        "group flex h-full w-full flex-col gap-3 rounded-2xl border bg-white px-4 py-4 text-left shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2",
        selected
          ? "border-[#2563EB] ring-2 ring-[#2563EB]/30"
          : "border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-md",
        variant === "mobile" && "px-3 py-3"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white",
            descriptor.toneClass
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        {selected ? (
          <Badge className="border border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]">
            <Check className="mr-1 h-3 w-3" />
            Selecionado
          </Badge>
        ) : (
          <Badge variant="outline" className={cn("border", descriptor.badgeClass)}>
            {descriptor.format}
          </Badge>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">
          {descriptor.shortLabel}
        </p>
        <p className="text-sm font-semibold text-[#0F172A]">{descriptor.title}</p>
        <p className="text-xs leading-5 text-[#64748B]">{descriptor.subtitle}</p>
      </div>
    </button>
  );
};

export default FiscalReportCard;
