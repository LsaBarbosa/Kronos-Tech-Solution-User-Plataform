import { cn } from "@/lib/utils";
import type { DocumentType } from "@/types/document";
import { DOCUMENT_TYPE_OPTIONS } from "../documents-ui.helpers";

interface DocumentTypeChipsProps {
  value: DocumentType | "";
  onChange: (next: DocumentType) => void;
  variant?: "desktop" | "mobile";
  disabled?: boolean;
}

const DocumentTypeChips = ({
  value,
  onChange,
  variant = "desktop",
  disabled,
}: DocumentTypeChipsProps) => {
  return (
    <div
      role="radiogroup"
      aria-label="Tipo de documento"
      className={cn(
        "flex flex-wrap gap-2",
        variant === "mobile" && "gap-2"
      )}
    >
      {DOCUMENT_TYPE_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={option.label}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "group inline-flex min-h-11 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
              isActive
                ? "border-[#2563EB] bg-[#2563EB] text-white shadow-sm"
                : "border-[#E2E8F0] bg-white text-[#0F172A] hover:border-[#2563EB] hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br",
                option.tone,
                isActive ? "text-white" : "text-white/95"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            <span className={variant === "mobile" ? "" : ""}>
              {variant === "mobile" ? option.shortLabel : option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default DocumentTypeChips;
