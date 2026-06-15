import { useCallback, useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useTimeOffResponsiveMode } from "../hooks/useTimeOffResponsiveMode";
import type { TimeOffRequestViewModel } from "../types";
import TimeOffDesktopExperience from "./TimeOffDesktopExperience";
import TimeOffMobileExperience from "./TimeOffMobileExperience";

interface TimeOffRequestShellProps {
  viewModel: TimeOffRequestViewModel;
}

const TimeOffRequestShell = ({ viewModel }: TimeOffRequestShellProps) => {
  const { isDesktop } = useTimeOffResponsiveMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  return (
    <>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} />
      <Header toggleSidebar={handleToggleSidebar} />
      <div className="pt-16">
        {isDesktop ? (
          <TimeOffDesktopExperience viewModel={viewModel} />
        ) : (
          <TimeOffMobileExperience viewModel={viewModel} />
        )}
      </div>
    </>
  );
};

export default TimeOffRequestShell;
