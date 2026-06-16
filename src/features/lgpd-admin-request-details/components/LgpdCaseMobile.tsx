import { getShortRequestCode } from "../utils/lgpdCaseFormatters";
import type { UseLgpdCaseDetailsReturn } from "../hooks/useLgpdCaseDetails";
import { LgpdCaseActionPanel } from "./LgpdCaseActionPanel";
import { LgpdCaseAnonymizationCard } from "./LgpdCaseAnonymizationCard";
import { LgpdCaseDescription } from "./LgpdCaseDescription";
import { LgpdCaseHero } from "./LgpdCaseHero";
import { LgpdCaseHistory } from "./LgpdCaseHistory";
import { LgpdCaseInfoCards } from "./LgpdCaseInfoCards";
import { LgpdCaseMobileDecisionBar } from "./LgpdCaseMobileDecisionBar";
import { LgpdCaseSummaryCard } from "./LgpdCaseSummaryCard";
import { LgpdWorkflowTimeline } from "./LgpdWorkflowTimeline";

interface LgpdCaseMobileProps {
  viewModel: UseLgpdCaseDetailsReturn;
}

export const LgpdCaseMobile = ({ viewModel }: LgpdCaseMobileProps) => {
  const { request, workflowSteps } = viewModel;
  if (!request) return null;
  const shortCode = getShortRequestCode(request.request.requestId);
  const currentStep = workflowSteps.find((step) => step.current);

  return (
    <div className="space-y-4 pb-28">
      <LgpdCaseHero
        variant="mobile"
        status={request.request.status}
        type={request.request.requestType}
        createdAt={request.request.createdAt}
        requestShortCode={shortCode}
        titularName={request.employee.fullName}
      />
      <LgpdCaseSummaryCard request={request} variant="mobile" />
      <LgpdWorkflowTimeline
        steps={workflowSteps}
        variant="mobile"
        currentLabel={currentStep?.label.toLowerCase()}
      />
      <LgpdCaseDescription
        type={request.request.requestType}
        description={request.request.description}
        resolutionNotes={request.request.resolutionNotes}
        variant="mobile"
      />
      <LgpdCaseAnonymizationCard request={request} viewModel={viewModel} />
      <LgpdCaseActionPanel viewModel={viewModel} variant="mobile" />
      <LgpdCaseHistory history={request.history} variant="mobile" />
      <LgpdCaseInfoCards request={request} />
      <LgpdCaseMobileDecisionBar viewModel={viewModel} />
    </div>
  );
};

export default LgpdCaseMobile;
