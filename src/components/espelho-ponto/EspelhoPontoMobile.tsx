import { EspelhoPontoFormCard } from "./EspelhoPontoFormCard";
import { EspelhoPontoHero } from "./EspelhoPontoHero";
import { EspelhoPontoSummaryPanel } from "./EspelhoPontoSummaryPanel";
import type { EspelhoPontoViewModel } from "./useEspelhoPontoViewModel";

interface EspelhoPontoMobileProps {
  viewModel: EspelhoPontoViewModel;
  roleLabel: string;
}

export const EspelhoPontoMobile = ({ viewModel, roleLabel }: EspelhoPontoMobileProps) => {
  return (
    <div className="space-y-5 pb-12">
      <EspelhoPontoHero
        variant="mobile"
        roleLabel={roleLabel}
        referenceLabel={viewModel.referenceLabel}
        scopeLabel={viewModel.selectedEmployeeLabel}
      />
      <EspelhoPontoFormCard viewModel={viewModel} variant="mobile" />
      <EspelhoPontoSummaryPanel viewModel={viewModel} roleLabel={roleLabel} />
    </div>
  );
};

export default EspelhoPontoMobile;
