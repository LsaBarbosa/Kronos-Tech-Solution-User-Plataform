import Header from "@/components/Header";
import { useTimeOffResponsiveMode } from "../hooks/useTimeOffResponsiveMode";
import type { TimeOffRequestViewModel } from "../types";
import TimeOffDesktopExperience from "./TimeOffDesktopExperience";
import TimeOffMobileExperience from "./TimeOffMobileExperience";

interface TimeOffRequestShellProps {
  viewModel: TimeOffRequestViewModel;
}

const TimeOffRequestShell = ({ viewModel }: TimeOffRequestShellProps) => {
  const { isDesktop } = useTimeOffResponsiveMode();

  return (
    <>
      <Header />
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
