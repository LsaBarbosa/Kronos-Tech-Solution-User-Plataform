import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { AdminAnonymizationWorkflow } from "@/components/privacy/AdminAnonymizationWorkflow";
import type { LgpdRequestDetailsResponse } from "@/service/lgpd.service";
import type { UseLgpdCaseDetailsReturn } from "../hooks/useLgpdCaseDetails";

interface LgpdCaseAnonymizationCardProps {
  request: LgpdRequestDetailsResponse;
  viewModel: UseLgpdCaseDetailsReturn;
}

const ANONYMIZATION_TYPES = new Set(["ANONYMIZATION", "DELETION"]);

export const LgpdCaseAnonymizationCard = ({
  request,
  viewModel,
}: LgpdCaseAnonymizationCardProps) => {
  if (!ANONYMIZATION_TYPES.has(request.request.requestType)) return null;

  return (
    <Card className="border border-[#DDD6FE] bg-white p-5 shadow-[0_10px_30px_rgba(11,18,32,0.06)]">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5B21B6]">
          Anonimização / Eliminação
        </p>
        <AdminAnonymizationWorkflow
          requestId={viewModel.requestId || ""}
          requestType={request.request.requestType}
          requestStatus={request.request.status}
          employeeFullName={request.employee.fullName}
          onAnonymizationComplete={(result) => {
            viewModel.setAnonymizationResult(result);
            toast.success("Anonimização concluída com sucesso!");
          }}
        />
      </div>
    </Card>
  );
};

export default LgpdCaseAnonymizationCard;
