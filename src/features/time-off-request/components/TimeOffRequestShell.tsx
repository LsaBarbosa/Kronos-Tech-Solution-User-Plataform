import { useTimeOffResponsiveMode } from "../hooks/useTimeOffResponsiveMode";
import type { TimeOffRequestViewModel } from "../types";
import TimeOffDesktopExperience from "./TimeOffDesktopExperience";
import TimeOffMobileExperience from "./TimeOffMobileExperience";

interface TimeOffRequestShellProps {
  viewModel: TimeOffRequestViewModel;
}

const TimeOffRequestShell = ({ viewModel }: TimeOffRequestShellProps) => {
  const { isDesktop } = useTimeOffResponsiveMode();

  return isDesktop ? (
    <TimeOffDesktopExperience viewModel={viewModel} />
  ) : (
    <TimeOffMobileExperience viewModel={viewModel} />
  );
};

export default TimeOffRequestShell;
