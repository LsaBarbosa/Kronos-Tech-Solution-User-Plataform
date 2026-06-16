import PageShell from "@/components/PageShell";
import { LgpdCaseDesktop } from "./components/LgpdCaseDesktop";
import { LgpdCaseErrorState } from "./components/LgpdCaseErrorState";
import { LgpdCaseLoading } from "./components/LgpdCaseLoading";
import { LgpdCaseMobile } from "./components/LgpdCaseMobile";
import { LgpdApprovalDialog } from "./components/dialogs/LgpdApprovalDialog";
import { LgpdCancelDialog } from "./components/dialogs/LgpdCancelDialog";
import { LgpdComplementDialog } from "./components/dialogs/LgpdComplementDialog";
import { LgpdCompletionDialog } from "./components/dialogs/LgpdCompletionDialog";
import { LgpdExportDialog } from "./components/dialogs/LgpdExportDialog";
import { LgpdRejectDialog } from "./components/dialogs/LgpdRejectDialog";
import { LgpdTransitionDialog } from "./components/dialogs/LgpdTransitionDialog";
import { useLgpdCaseDetails } from "./hooks/useLgpdCaseDetails";
import { useLgpdCaseResponsiveMode } from "./hooks/useLgpdCaseResponsiveMode";

export const AdminLgpdRequestDetailsPage = () => {
  const viewModel = useLgpdCaseDetails();
  const { isDesktop } = useLgpdCaseResponsiveMode();

  return (
    <PageShell mainClassName="pt-24 sm:pt-32 px-4 pb-8 sm:px-6 lg:px-8 relative z-10 overflow-x-hidden bg-[#F8FAFC]">
      <div className="mx-auto w-full max-w-7xl">
        {viewModel.loading ? (
          <LgpdCaseLoading />
        ) : viewModel.error || !viewModel.request ? (
          <LgpdCaseErrorState
            message={viewModel.error || "Solicitação não encontrada"}
            onBack={viewModel.goBack}
          />
        ) : isDesktop ? (
          <LgpdCaseDesktop viewModel={viewModel} />
        ) : (
          <LgpdCaseMobile viewModel={viewModel} />
        )}

        <LgpdApprovalDialog viewModel={viewModel} />
        <LgpdCompletionDialog viewModel={viewModel} />
        <LgpdRejectDialog viewModel={viewModel} />
        <LgpdTransitionDialog viewModel={viewModel} />
        <LgpdComplementDialog viewModel={viewModel} />
        <LgpdCancelDialog viewModel={viewModel} />
        <LgpdExportDialog viewModel={viewModel} />
      </div>
    </PageShell>
  );
};

export default AdminLgpdRequestDetailsPage;
