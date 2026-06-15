import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { APP_PATHS } from "@/config/app-routes";
import FiscalDesktopView from "@/features/fiscal-audit/components/FiscalDesktopView";
import FiscalMobileView from "@/features/fiscal-audit/components/FiscalMobileView";
import { useFiscalAuditResponsiveMode } from "@/features/fiscal-audit/useFiscalAuditResponsiveMode";
import { useFiscalAuditViewModel } from "@/features/fiscal-audit/useFiscalAuditViewModel";

const AuditoriaFiscal = () => {
  const navigate = useNavigate();
  const { isDesktop } = useFiscalAuditResponsiveMode();
  const viewModel = useFiscalAuditViewModel();

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
        <FiscalDesktopView viewModel={viewModel} onBack={handleBack} />
      ) : (
        <FiscalMobileView viewModel={viewModel} onBack={handleBack} />
      )}
    </PageShell>
  );
};

export default AuditoriaFiscal;
