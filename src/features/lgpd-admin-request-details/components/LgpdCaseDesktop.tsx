import { Card } from "@/components/ui/card";
import { getShortRequestCode } from "../utils/lgpdCaseFormatters";
import type { UseLgpdCaseDetailsReturn } from "../hooks/useLgpdCaseDetails";
import { LgpdCaseActionPanel } from "./LgpdCaseActionPanel";
import { LgpdCaseAnonymizationCard } from "./LgpdCaseAnonymizationCard";
import { LgpdCaseDescription } from "./LgpdCaseDescription";
import { LgpdCaseHero } from "./LgpdCaseHero";
import { LgpdCaseHistory } from "./LgpdCaseHistory";
import { LgpdCaseInfoCards } from "./LgpdCaseInfoCards";
import { LgpdCaseSummaryCard } from "./LgpdCaseSummaryCard";
import { LgpdWorkflowTimeline } from "./LgpdWorkflowTimeline";

interface LgpdCaseDesktopProps {
  viewModel: UseLgpdCaseDetailsReturn;
}

export const LgpdCaseDesktop = ({ viewModel }: LgpdCaseDesktopProps) => {
  const { request, workflowSteps } = viewModel;
  if (!request) return null;
  const shortCode = getShortRequestCode(request.request.requestId);

  return (
    <div className="space-y-6">
      <LgpdCaseHero
        variant="desktop"
        status={request.request.status}
        type={request.request.requestType}
        createdAt={request.request.createdAt}
        requestShortCode={shortCode}
        titularName={request.employee.fullName}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(360px,0.95fr)]">
        <div className="space-y-6 min-w-0">
          <Card className="border border-[#E2E8F0] bg-white p-5 shadow-[0_10px_30px_rgba(11,18,32,0.08)]">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">
                Caso #{shortCode}
              </p>
              <p className="text-lg font-semibold text-[#0F172A]">
                Titular, empresa, descrição e histórico do tratamento.
              </p>
            </div>
            <div className="mt-4 space-y-4">
              <LgpdCaseSummaryCard request={request} variant="desktop" />
              <LgpdWorkflowTimeline steps={workflowSteps} variant="desktop" />
              <LgpdCaseDescription
                type={request.request.requestType}
                description={request.request.description}
                resolutionNotes={request.request.resolutionNotes}
                variant="desktop"
              />
              <LgpdCaseAnonymizationCard request={request} viewModel={viewModel} />
              <LgpdCaseHistory history={request.history} variant="desktop" />
            </div>
          </Card>

          <LgpdCaseInfoCards request={request} />
        </div>

        <div className="space-y-6 min-w-0">
          <LgpdCaseActionPanel viewModel={viewModel} variant="desktop" />
        </div>
      </div>
    </div>
  );
};

export default LgpdCaseDesktop;
