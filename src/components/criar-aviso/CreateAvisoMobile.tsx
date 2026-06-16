import { CreateAvisoActionFooter } from "./CreateAvisoActionFooter";
import { CreateAvisoFormCard } from "./CreateAvisoFormCard";
import { CreateAvisoHero } from "./CreateAvisoHero";
import { CreateAvisoRecipientsCard } from "./CreateAvisoRecipientsCard";
import { CreateAvisoSummaryPanel } from "./CreateAvisoSummaryPanel";
import type { CreateAvisoViewModel } from "./useCreateAvisoViewModel";

interface CreateAvisoMobileProps {
  viewModel: CreateAvisoViewModel;
}

export const CreateAvisoMobile = ({ viewModel }: CreateAvisoMobileProps) => {
  return (
    <div className="space-y-5 pb-32">
      <CreateAvisoHero
        variant="mobile"
        tipoLabel={viewModel.tipoLabel}
        recipientsLabel={viewModel.recipientsLabel}
      />
      <CreateAvisoFormCard viewModel={viewModel} variant="mobile" />
      <CreateAvisoRecipientsCard viewModel={viewModel} variant="mobile" />
      <CreateAvisoSummaryPanel viewModel={viewModel} />
      <CreateAvisoActionFooter viewModel={viewModel} variant="mobile" />
    </div>
  );
};

export default CreateAvisoMobile;
