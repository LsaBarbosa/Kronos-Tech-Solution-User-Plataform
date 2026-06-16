import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarRange, FileSpreadsheet, ShieldCheck } from "lucide-react";
import type { EspelhoPontoViewModel } from "./useEspelhoPontoViewModel";

interface EspelhoPontoSummaryPanelProps {
  viewModel: EspelhoPontoViewModel;
  roleLabel: string;
}

export const EspelhoPontoSummaryPanel = ({
  viewModel,
  roleLabel,
}: EspelhoPontoSummaryPanelProps) => {
  const { referenceLabel, selectedEmployeeLabel } = viewModel;

  return (
    <Card className="border border-[#D8E2EC] bg-white shadow-[0_10px_30px_rgba(16,42,67,0.08)]">
      <CardContent className="space-y-4 p-6">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#627D98]">
            Governança
          </p>
          <p className="text-lg font-semibold text-[#102A43]">Prévia do espelho</p>
        </div>

        <div className="space-y-3 text-sm text-[#334E68]">
          <div className="flex items-start gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
            <CalendarRange className="mt-0.5 h-5 w-5 shrink-0 text-[#1F4E5F]" />
            <div className="space-y-0.5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#627D98]">
                Mês de referência
              </p>
              <p className="text-sm font-medium text-[#102A43]">{referenceLabel}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
            <FileSpreadsheet className="mt-0.5 h-5 w-5 shrink-0 text-[#1F4E5F]" />
            <div className="space-y-0.5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#627D98]">
                Escopo
              </p>
              <p className="text-sm font-medium text-[#102A43]">{selectedEmployeeLabel}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#1F4E5F]" />
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#627D98]">
                Papel ativo
              </p>
              <Badge className="rounded-full border border-[#D8E2EC] bg-white px-3 py-1 text-[11px] font-semibold text-[#102A43]">
                {roleLabel}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EspelhoPontoSummaryPanel;
