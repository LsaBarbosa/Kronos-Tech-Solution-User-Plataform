import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { APP_PATHS } from "@/config/app-routes";
import FiscalDesktopView from "@/features/fiscal-audit/components/FiscalDesktopView";
import FiscalMobileView from "@/features/fiscal-audit/components/FiscalMobileView";
import { useFiscalAuditResponsiveMode } from "@/features/fiscal-audit/useFiscalAuditResponsiveMode";
import { useFiscalAuditViewModel } from "@/features/fiscal-audit/useFiscalAuditViewModel";
import { FaqContextualBlock } from "@/components/faq/FaqContextualBlock";
import { FAQ_SCREEN_KEYS } from "@/constants/faqScreenKeys";

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
      <FaqContextualBlock screenKey={FAQ_SCREEN_KEYS.AUDIT} className="mt-6" />
    </PageShell>
  );
};

export default AuditoriaFiscal;
