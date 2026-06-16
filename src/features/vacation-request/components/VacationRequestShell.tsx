import Header from "@/components/Header";
import { useVacationResponsiveMode } from "../hooks/useVacationResponsiveMode";
import { useVacationRequestViewModel } from "../hooks/useVacationRequestViewModel";
import VacationRequestDesktop from "./VacationRequestDesktop";
import VacationRequestMobile from "./VacationRequestMobile";

export const VacationRequestShell = () => {
  const viewModel = useVacationRequestViewModel();
  const { isDesktop } = useVacationResponsiveMode();

  return (
    <>
      <Header />
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
