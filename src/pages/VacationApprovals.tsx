import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { APP_PATHS } from "@/config/app-routes";
import VacationApprovalDesktop from "@/features/vacation-approvals/components/VacationApprovalDesktop";
import VacationApprovalMobile from "@/features/vacation-approvals/components/VacationApprovalMobile";
import VacationApprovalConfirmDialog from "@/features/vacation-approvals/components/VacationApprovalConfirmDialog";
import { useVacationApprovalResponsiveMode } from "@/features/vacation-approvals/hooks/useVacationApprovalResponsiveMode";
import { useVacationApprovalViewModel } from "@/features/vacation-approvals/hooks/useVacationApprovalViewModel";

export const VacationApprovals = () => {
  const navigate = useNavigate();
  const { isDesktop } = useVacationApprovalResponsiveMode();
  const viewModel = useVacationApprovalViewModel();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const handleBack = useCallback(() => navigate(APP_PATHS.dashboard), [navigate]);

  return (
    <PageShell
      sidebarOpen={sidebarOpen}
      toggleSidebar={handleToggleSidebar}
      mainClassName="pt-24 sm:pt-32 mobile-container pb-36 sm:pb-12 px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 relative z-10 bg-[#F8FAFC] overflow-x-hidden"
    >
      {isDesktop ? (
        <VacationApprovalDesktop viewModel={viewModel} onBack={handleBack} />
      ) : (
        <VacationApprovalMobile viewModel={viewModel} onBack={handleBack} />
      )}

      <VacationApprovalConfirmDialog
        request={viewModel.decisionTarget}
        action={viewModel.decisionAction}
        isBusy={viewModel.isMutating}
        onCancel={viewModel.cancelDecision}
        onConfirm={viewModel.confirmDecision}
      />
    </PageShell>
  );
};

export default VacationApprovals;
