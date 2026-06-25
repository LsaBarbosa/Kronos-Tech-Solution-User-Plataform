import Header from "@/components/Header";
import { FaqContextualBlock } from "@/components/faq/FaqContextualBlock";
import { FAQ_SCREEN_KEYS } from "@/constants/faqScreenKeys";
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
      <FaqContextualBlock screenKey={FAQ_SCREEN_KEYS.TIME_OFF} className="mt-6 px-4" />
    </>
  );
};

export default TimeOffRequestShell;
