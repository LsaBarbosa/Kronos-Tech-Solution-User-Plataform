import { Download, FilePlus2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrivacyStickyActionBarProps {
  nextActionLabel: string;
  isExporting: boolean;
  onExport: () => void;
  onNewRequest: () => void;
}

const PrivacyStickyActionBar = ({
  nextActionLabel,
  isExporting,
  onExport,
  onNewRequest,
}: PrivacyStickyActionBarProps) => {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <div className="min-w-0 flex-1 text-[11px] leading-4 text-[#475569]">
          <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0F172A]">
            <ShieldCheck className="h-3 w-3 text-[#0D9488]" />
            Próxima ação
          </p>
          <p className="truncate text-xs text-[#0F172A]">{nextActionLabel}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExport}
            disabled={isExporting}
            className="h-11 gap-1 border-[#D8E2EC] bg-white text-[#102A43] hover:bg-[#F4F6F9]"
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onNewRequest}
            className="h-11 gap-1 bg-[#7C3AED] text-white hover:bg-[#6D28D9]"
          >
            <FilePlus2 className="h-4 w-4" />
            Solicitar direito
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyStickyActionBar;
