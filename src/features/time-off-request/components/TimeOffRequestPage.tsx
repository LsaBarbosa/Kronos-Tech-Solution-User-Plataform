import TimeOffRequestShell from "./TimeOffRequestShell";
import { useTimeOffRequestViewModel } from "../hooks/useTimeOffRequestViewModel";

export const TimeOffRequestPage = () => {
  const viewModel = useTimeOffRequestViewModel();

  return <TimeOffRequestShell viewModel={viewModel} />;
};

export default TimeOffRequestPage;
