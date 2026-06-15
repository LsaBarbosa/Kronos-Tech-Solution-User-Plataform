import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { APP_PATHS } from "@/config/app-routes";
import TimeOffApprovalDesktop from "@/features/time-off-approvals/components/TimeOffApprovalDesktop";
import TimeOffApprovalMobile from "@/features/time-off-approvals/components/TimeOffApprovalMobile";
import TimeOffApprovalConfirmDialog from "@/features/time-off-approvals/components/TimeOffApprovalConfirmDialog";
import { useTimeOffApprovalResponsiveMode } from "@/features/time-off-approvals/hooks/useTimeOffApprovalResponsiveMode";
import { useTimeOffApprovalViewModel } from "@/features/time-off-approvals/hooks/useTimeOffApprovalViewModel";

const ManualRegisterApprovals = () => {
  const navigate = useNavigate();
  const { isDesktop } = useTimeOffApprovalResponsiveMode();
  const viewModel = useTimeOffApprovalViewModel();

  const handleBack = useCallback(() => {
    navigate(APP_PATHS.dashboard);
  }, [navigate]);

  return (
    <PageShell
      sidebarOpen={viewModel.sidebarOpen}
      toggleSidebar={viewModel.handleToggleSidebar}
      mainClassName="pt-24 sm:pt-32 mobile-container pb-36 sm:pb-12 space-y-6 sm:space-y-8 relative z-10 overflow-x-hidden"
    >
      {isDesktop ? (
        <TimeOffApprovalDesktop viewModel={viewModel} onBack={handleBack} />
      ) : (
        <TimeOffApprovalMobile viewModel={viewModel} onBack={handleBack} />
      )}

      <TimeOffApprovalConfirmDialog
        request={viewModel.decisionTarget}
        action={viewModel.decisionAction}
        isBusy={viewModel.isMutating}
        onCancel={viewModel.cancelDecision}
        onConfirm={viewModel.confirmDecision}
      />
    </PageShell>
  );
};

export default ManualRegisterApprovals;
