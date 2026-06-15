import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { APP_PATHS } from "@/config/app-routes";
import ApprovalDesktop from "@/features/pending-approvals/components/ApprovalDesktop";
import ApprovalMobile from "@/features/pending-approvals/components/ApprovalMobile";
import { useApprovalsResponsiveMode } from "@/features/pending-approvals/hooks/useApprovalsResponsiveMode";
import { usePendingApprovalsViewModel } from "@/features/pending-approvals/hooks/usePendingApprovalsViewModel";

export const PendingApprovals = () => {
  const navigate = useNavigate();
  const { isDesktop } = useApprovalsResponsiveMode();
  const viewModel = usePendingApprovalsViewModel();

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
        <ApprovalDesktop viewModel={viewModel} onBack={handleBack} />
      ) : (
        <ApprovalMobile viewModel={viewModel} onBack={handleBack} />
      )}
    </PageShell>
  );
};

export default PendingApprovals;
