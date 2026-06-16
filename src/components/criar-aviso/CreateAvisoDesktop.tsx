import { CreateAvisoActionFooter } from "./CreateAvisoActionFooter";
import { CreateAvisoFormCard } from "./CreateAvisoFormCard";
import { CreateAvisoHero } from "./CreateAvisoHero";
import { CreateAvisoRecipientsCard } from "./CreateAvisoRecipientsCard";
import { CreateAvisoSummaryPanel } from "./CreateAvisoSummaryPanel";
import type { CreateAvisoViewModel } from "./useCreateAvisoViewModel";

interface CreateAvisoDesktopProps {
  viewModel: CreateAvisoViewModel;
}

export const CreateAvisoDesktop = ({ viewModel }: CreateAvisoDesktopProps) => {
  return (
    <div className="space-y-6">
      <CreateAvisoHero
        variant="desktop"
        tipoLabel={viewModel.tipoLabel}
        recipientsLabel={viewModel.recipientsLabel}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.95fr)]">
        <div className="space-y-6 min-w-0">
          <CreateAvisoFormCard viewModel={viewModel} variant="desktop" />
          <CreateAvisoRecipientsCard viewModel={viewModel} variant="desktop" />
          <CreateAvisoActionFooter viewModel={viewModel} variant="desktop" />
        </div>
        <div className="space-y-6 min-w-0">
          <CreateAvisoSummaryPanel viewModel={viewModel} />
        </div>
      </div>
    </div>
  );
};

export default CreateAvisoDesktop;
