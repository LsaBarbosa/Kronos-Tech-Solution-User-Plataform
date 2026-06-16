import { EspelhoPontoFormCard } from "./EspelhoPontoFormCard";
import { EspelhoPontoHero } from "./EspelhoPontoHero";
import { EspelhoPontoSummaryPanel } from "./EspelhoPontoSummaryPanel";
import type { EspelhoPontoViewModel } from "./useEspelhoPontoViewModel";

interface EspelhoPontoDesktopProps {
  viewModel: EspelhoPontoViewModel;
  roleLabel: string;
}

export const EspelhoPontoDesktop = ({ viewModel, roleLabel }: EspelhoPontoDesktopProps) => {
  return (
    <div className="space-y-6">
      <EspelhoPontoHero
        variant="desktop"
        roleLabel={roleLabel}
        referenceLabel={viewModel.referenceLabel}
        scopeLabel={viewModel.selectedEmployeeLabel}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.95fr)]">
        <div className="space-y-6 min-w-0">
          <EspelhoPontoFormCard viewModel={viewModel} variant="desktop" />
        </div>
        <div className="space-y-6 min-w-0">
          <EspelhoPontoSummaryPanel viewModel={viewModel} roleLabel={roleLabel} />
        </div>
      </div>
    </div>
  );
};

export default EspelhoPontoDesktop;
