import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FiscalReportDescriptor } from "../utils/fiscal-helpers";

interface FiscalMobileStickyBarProps {
  descriptor: FiscalReportDescriptor;
  monthRef: Date | undefined;
  isLoading: boolean;
  isCtaDisabled: boolean;
  onDownload: () => void;
}

const FiscalMobileStickyBar = ({
  descriptor,
  monthRef,
  isLoading,
  isCtaDisabled,
  onDownload,
}: FiscalMobileStickyBarProps) => {
  const refLabel = descriptor.requiresMonth
    ? monthRef
      ? format(monthRef, "MMM/yy", { locale: ptBR })
      : "Sem mês"
    : "Estático";

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <div className="min-w-0 flex-1 text-[11px] leading-4 text-[#475569]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0F172A]">
            Próximo download
          </p>
          <p className="truncate text-xs text-[#0F172A]">
            {descriptor.shortLabel} · {descriptor.format} · {refLabel}
          </p>
        </div>
        <Button
          type="button"
          onClick={onDownload}
          disabled={isCtaDisabled}
          className="h-11 shrink-0 gap-1 bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {isLoading ? "Gerando..." : "Baixar arquivo fiscal"}
        </Button>
      </div>
    </div>
  );
};

export default FiscalMobileStickyBar;
