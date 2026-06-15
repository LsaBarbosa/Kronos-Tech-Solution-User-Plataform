import { useCallback, useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useVacationResponsiveMode } from "../hooks/useVacationResponsiveMode";
import { useVacationRequestViewModel } from "../hooks/useVacationRequestViewModel";
import VacationRequestDesktop from "./VacationRequestDesktop";
import VacationRequestMobile from "./VacationRequestMobile";

export const VacationRequestShell = () => {
  const viewModel = useVacationRequestViewModel();
  const { isDesktop } = useVacationResponsiveMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  return (
    <>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} />
      <Header toggleSidebar={handleToggleSidebar} />
      <div className="pt-16">
        {isDesktop ? (
          <VacationRequestDesktop viewModel={viewModel} />
        ) : (
          <VacationRequestMobile viewModel={viewModel} />
        )}
      </div>
    </>
  );
};

export default VacationRequestShell;
