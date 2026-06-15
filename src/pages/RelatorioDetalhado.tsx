import { useState } from "react";
import PageShell from "@/components/PageShell";
import { RegistroEdicaoModal } from "@/components/RegistroEdicaoModal";
import { DetailedReportDesktop, DetailedReportMobile } from "@/components/relatorio-detalhado";
import { useDetailedReportBuilder } from "@/hooks/useDetailedReportBuilder";
import { useReportResponsiveMode } from "@/hooks/useReportResponsiveMode";

const RelatorioDetalhado = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const viewModel = useDetailedReportBuilder();
  const { isDesktop } = useReportResponsiveMode();

  return (
    <PageShell
      sidebarOpen={sidebarOpen}
      toggleSidebar={() => setSidebarOpen((previous) => !previous)}
      mainClassName="pt-16 px-4 py-5 sm:px-6 sm:py-8 lg:px-8 relative z-10 overflow-x-hidden bg-[#D9E2EB]"
    >
      <div className="mx-auto w-full max-w-7xl">
        {isDesktop ? (
          <DetailedReportDesktop viewModel={viewModel} />
        ) : (
          <DetailedReportMobile viewModel={viewModel} />
        )}

        <RegistroEdicaoModal
          isOpen={viewModel.editModalOpen}
          setIsOpen={viewModel.setEditModalOpen}
          managers={viewModel.managers}
          selectedRecord={viewModel.selectedRecord}
          onSaveRecord={viewModel.handleSaveRecord}
          form={viewModel.form}
          isSavingRecord={viewModel.isSavingRecord}
        />
      </div>
    </PageShell>
  );
};

export default RelatorioDetalhado;
