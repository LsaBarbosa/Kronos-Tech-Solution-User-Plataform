import { useVacationResponsiveMode } from "../hooks/useVacationResponsiveMode";
import { useVacationRequestViewModel } from "../hooks/useVacationRequestViewModel";
import VacationRequestDesktop from "./VacationRequestDesktop";
import VacationRequestMobile from "./VacationRequestMobile";

export const VacationRequestShell = () => {
  const viewModel = useVacationRequestViewModel();
  const { isDesktop } = useVacationResponsiveMode();

  return isDesktop ? <VacationRequestDesktop viewModel={viewModel} /> : <VacationRequestMobile viewModel={viewModel} />;
};

export default VacationRequestShell;

