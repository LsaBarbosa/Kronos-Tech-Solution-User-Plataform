import PageShell from "@/components/PageShell";
import { useReportResponsiveMode } from "@/hooks/useReportResponsiveMode";
import {
  CreateAvisoDesktop,
  CreateAvisoMobile,
  useCreateAvisoViewModel,
} from "@/components/criar-aviso";

const CriarAviso = () => {
  const viewModel = useCreateAvisoViewModel();
  const { isDesktop } = useReportResponsiveMode();

  return (
    <PageShell mainClassName="pt-24 sm:pt-32 px-4 pb-5 sm:px-6 sm:pb-8 lg:px-8 relative z-10 overflow-x-hidden bg-[#D9E2EB]">
      <div className="mx-auto w-full max-w-7xl">
        {isDesktop ? (
          <CreateAvisoDesktop viewModel={viewModel} />
        ) : (
          <CreateAvisoMobile viewModel={viewModel} />
        )}
      </div>
    </PageShell>
  );
};

export default CriarAviso;
