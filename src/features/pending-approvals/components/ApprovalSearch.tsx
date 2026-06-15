import { Eraser, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ApprovalSearchProps {
  variant: "desktop" | "mobile";
  draftValue: string;
  appliedValue: string;
  hasActiveFilter: boolean;
  isBusy: boolean;
  onDraftChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
}

const ApprovalSearch = ({
  variant,
  draftValue,
  appliedValue,
  hasActiveFilter,
  isBusy,
  onDraftChange,
  onSubmit,
  onClear,
}: ApprovalSearchProps) => {
  return (
    <div className={cn("space-y-2", variant === "desktop" && "space-y-3")}>
      <Label
        htmlFor="apuracao-search"
        className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]"
      >
        Buscar por colaborador
      </Label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]"
            aria-hidden="true"
          />
          <Input
            id="apuracao-search"
            value={draftValue}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onSubmit();
              }
            }}
            placeholder="Digite o nome do colaborador..."
            disabled={isBusy}
            className="h-11 pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isBusy || draftValue.trim() === appliedValue}
            className="h-11 gap-1 bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
          >
            <Search className="h-4 w-4" />
            Buscar
          </Button>
          {hasActiveFilter ? (
            <Button
              type="button"
              variant="outline"
              onClick={onClear}
              disabled={isBusy}
              className="h-11 gap-1 border-[#D8E2EC] bg-white text-[#102A43] hover:bg-[#F4F6F9]"
            >
              <Eraser className="h-4 w-4" />
              Limpar
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ApprovalSearch;
