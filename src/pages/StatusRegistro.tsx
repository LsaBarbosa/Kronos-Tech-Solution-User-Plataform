import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { APP_PATHS } from "@/config/app-routes";
import StatusRegistroDesktop from "@/components/status-registro/StatusRegistroDesktop";
import StatusRegistroMobile from "@/components/status-registro/StatusRegistroMobile";
import StatusConfirmDialog from "@/components/status-registro/StatusConfirmDialog";
import { useStatusRegistroResponsiveMode } from "@/components/status-registro/useStatusRegistroResponsiveMode";
import { useStatusRegistroViewModel } from "@/components/status-registro/useStatusRegistroViewModel";

const StatusRegistro = () => {
  const navigate = useNavigate();
  const { isDesktop } = useStatusRegistroResponsiveMode();
  const viewModel = useStatusRegistroViewModel();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const handleBack = useCallback(() => navigate(APP_PATHS.dashboard), [navigate]);

  return (
    <PageShell
      sidebarOpen={sidebarOpen}
      toggleSidebar={handleToggleSidebar}
      mainClassName="pt-24 sm:pt-32 mobile-container pb-36 sm:pb-12 space-y-6 sm:space-y-8 relative z-10 overflow-x-hidden"
    >
      {isDesktop ? (
        <StatusRegistroDesktop viewModel={viewModel} onBack={handleBack} />
      ) : (
        <StatusRegistroMobile viewModel={viewModel} onBack={handleBack} />
      )}

      <StatusConfirmDialog
        action={viewModel.pendingDecision}
        record={viewModel.selectedRecord}
        newStatus={viewModel.newStatus}
        isSaving={viewModel.isSavingStatus}
        isToggling={viewModel.isTogglingActivate}
        onCancel={viewModel.cancelDecision}
        onConfirm={viewModel.confirmDecision}
      />
    </PageShell>
  );
};

export default StatusRegistro;
