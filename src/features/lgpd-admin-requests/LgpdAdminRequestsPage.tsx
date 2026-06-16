import PageShell from "@/components/PageShell";
import { LgpdAdminRequestsDesktop } from "./LgpdAdminRequestsDesktop";
import { LgpdAdminRequestsMobile } from "./LgpdAdminRequestsMobile";
import { useLgpdAdminRequestsViewModel } from "./hooks/useLgpdAdminRequestsViewModel";
import { useLgpdAdminResponsiveMode } from "./hooks/useLgpdAdminResponsiveMode";

export const LgpdAdminRequestsPage = () => {
  const viewModel = useLgpdAdminRequestsViewModel();
  const { isDesktop } = useLgpdAdminResponsiveMode();

  return (
    <PageShell mainClassName="pt-24 sm:pt-32 px-4 pb-8 sm:px-6 lg:px-8 relative z-10 overflow-x-hidden bg-[#F8FAFC]">
      <div className="mx-auto w-full max-w-7xl">
        {isDesktop ? (
          <LgpdAdminRequestsDesktop viewModel={viewModel} />
        ) : (
          <LgpdAdminRequestsMobile viewModel={viewModel} />
        )}
      </div>
    </PageShell>
  );
};

export default LgpdAdminRequestsPage;
