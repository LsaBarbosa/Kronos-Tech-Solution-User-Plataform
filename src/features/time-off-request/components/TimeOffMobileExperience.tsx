import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { timeOffRequestTokens } from "../styles/timeOffRequest.tokens";
import { getTimeOffStepValidationMessage } from "../utils/timeOffValidation";
import type { TimeOffRequestStep, TimeOffRequestViewModel } from "../types";
import TimeOffTypeSelector from "./TimeOffTypeSelector";
import TimeOffDateTimeFields from "./TimeOffDateTimeFields";
import TimeOffManagerSelector from "./TimeOffManagerSelector";
import TimeOffEvidenceUploader from "./TimeOffEvidenceUploader";
import TimeOffApprovalSummary from "./TimeOffApprovalSummary";
import TimeOffMobileStepper from "./TimeOffMobileStepper";
import TimeOffMobileActionBar from "./TimeOffMobileActionBar";
import { formatTimeOffTypeLabel } from "../utils/timeOffFormatting";
import TimeOffOperationalChecklist from "./TimeOffOperationalChecklist";
import type { TimeOffRequestType } from "../types";

interface TimeOffMobileExperienceProps {
  viewModel: TimeOffRequestViewModel;
}

const steps: TimeOffRequestStep[] = ["type", "period", "manager", "evidence", "review"];

const TimeOffMobileExperience = ({ viewModel }: TimeOffMobileExperienceProps) => {
  const [activeStep, setActiveStep] = useState<TimeOffRequestStep>("type");
  const [policyOpen, setPolicyOpen] = useState(false);

  const periodLabel = viewModel.periodSummary.periodLabel;
  const selection = useMemo(
    () => ({
      requestType: viewModel.requestType,
      startDate: viewModel.startDate,
      endDate: viewModel.endDate,
      startHour: viewModel.startHour,
      endHour: viewModel.endHour,
      managerId: viewModel.managerId,
      document: viewModel.document,
    }),
    [viewModel.document, viewModel.endDate, viewModel.endHour, viewModel.managerId, viewModel.requestType, viewModel.startDate, viewModel.startHour]
  );

  const stepValidationMessage = getTimeOffStepValidationMessage(activeStep, selection);

  const resetFlow = () => {
    viewModel.reset();
    setActiveStep("type");
  };

  const goBack = () => {
    const currentIndex = steps.indexOf(activeStep);

    if (currentIndex <= 0) {
      resetFlow();
      return;
    }

    setActiveStep(steps[currentIndex - 1]);
  };

  const goForward = () => {
    if (activeStep === "type") {
      if (!selection.requestType) {
        return;
      }

      setActiveStep("period");
      return;
    }

    if (activeStep === "period") {
      if (!viewModel.periodSummary.isValid) {
        return;
      }

      setActiveStep("manager");
      return;
    }

    if (activeStep === "manager") {
      if (!selection.managerId) {
        return;
      }

      setActiveStep("evidence");
      return;
    }

    if (activeStep === "evidence") {
      setActiveStep("review");
      return;
    }

    viewModel.submit();
  };

  const handleTypeChange = (type: TimeOffRequestType) => {
    viewModel.setRequestType(type);
    setActiveStep("period");
  };

  const handleManagerChange = (managerId: string) => {
    viewModel.setManagerId(managerId);
    setActiveStep("evidence");
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-[#102A43]" style={{ background: timeOffRequestTokens.gradients.screen }}>
      <div className="absolute inset-0">
        <div className="absolute -left-16 top-0 h-52 w-52 rounded-full bg-[#22B8CF]/10 blur-3xl" />
        <div className="absolute right-[-4rem] top-24 h-56 w-56 rounded-full bg-[#1F4E5F]/10 blur-3xl" />
      </div>

      <main className="relative mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 pb-36 pt-4">
        <div className="rounded-[28px] bg-[#0B1220] px-5 py-6 text-white shadow-[0_24px_70px_rgba(11,18,32,0.24)]">
          <p className="text-3xl font-semibold tracking-tight">Formalize seu abono</p>
          <p className="mt-2 text-sm leading-6 text-[#DCE7F5]">
            Escolha tipo, período e evidência para aprovação gerencial.
          </p>
        </div>

        <TimeOffMobileStepper value={activeStep} onChange={setActiveStep} />

        <div className={cn(activeStep !== "type" && "hidden")}>
          <TimeOffTypeSelector
            variant="mobile"
            value={viewModel.requestType}
            onChange={handleTypeChange}
            validationMessage={stepValidationMessage}
          />
        </div>

        <div className={cn(activeStep !== "period" && "hidden")}>
          <TimeOffDateTimeFields
            variant="mobile"
            startDate={viewModel.startDate}
            endDate={viewModel.endDate}
            startHour={viewModel.startHour}
            endHour={viewModel.endHour}
            periodSummary={viewModel.periodSummary}
            validationMessage={stepValidationMessage}
            onStartDateChange={viewModel.setStartDate}
            onEndDateChange={viewModel.setEndDate}
            onStartHourChange={viewModel.setStartHour}
            onEndHourChange={viewModel.setEndHour}
          />
        </div>

        <div className={cn(activeStep !== "manager" && "hidden")}>
          <TimeOffManagerSelector
            variant="mobile"
            managerOptions={viewModel.managerOptions}
            managerId={viewModel.managerId}
            selectedManager={viewModel.selectedManager}
            isLoadingManagers={viewModel.isLoadingManagers}
            managerErrorMessage={viewModel.managerErrorMessage}
            onManagerChange={handleManagerChange}
          />
        </div>

        <div className={cn(activeStep !== "evidence" && "hidden")}>
          <TimeOffEvidenceUploader
            variant="mobile"
            document={viewModel.document}
            documentSummary={viewModel.documentSummary}
            documentError={viewModel.documentError}
            isPreparingDocument={viewModel.isPreparingDocument}
            isSubmitting={viewModel.isSubmitting}
            onDocumentChange={viewModel.setDocument}
            onClearDocument={viewModel.clearDocument}
            onOpenPolicy={() => setPolicyOpen(true)}
          />
          <div className="mt-4">
            <TimeOffOperationalChecklist onOpenAttachmentPolicy={() => setPolicyOpen(true)} variant="mobile" />
          </div>
        </div>

        <div className={cn(activeStep !== "review" && "hidden")} id="timeoff-mobile-review">
          <TimeOffApprovalSummary
            variant="mobile"
            periodSummary={viewModel.periodSummary}
            requestTypeLabel={formatTimeOffTypeLabel(viewModel.requestType)}
            manager={viewModel.selectedManager}
            documentSummary={viewModel.documentSummary}
            validationMessage={viewModel.validationMessage}
            submitErrorMessage={viewModel.submitErrorMessage}
            successTimeRecordId={viewModel.successTimeRecordId}
            canSubmit={viewModel.canSubmit}
            isSubmitting={viewModel.isSubmitting}
            onSubmit={viewModel.submit}
            onReset={viewModel.reset}
            showActions={false}
          />
          <div className="mt-4">
            <TimeOffOperationalChecklist onOpenAttachmentPolicy={() => setPolicyOpen(true)} variant="mobile" />
          </div>
        </div>
      </main>

      <TimeOffMobileActionBar
        activeStep={activeStep}
        canAdvance={
          activeStep === "type"
            ? Boolean(selection.requestType)
            : activeStep === "period"
              ? viewModel.periodSummary.isValid
              : activeStep === "manager"
                ? Boolean(selection.managerId)
                : true
        }
        canSubmit={viewModel.canSubmit}
        isSubmitting={viewModel.isSubmitting}
        hasSuccess={Boolean(viewModel.successTimeRecordId)}
        periodLabel={periodLabel}
        onPrimaryAction={goForward}
        onSecondaryAction={goBack}
        onReset={resetFlow}
      />

      <Dialog open={policyOpen} onOpenChange={setPolicyOpen}>
        <DialogContent className="max-w-lg rounded-[28px] border-[#D8E2EC] bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#102A43]">Política de anexo</DialogTitle>
            <DialogDescription className="text-[#627D98]">
              O arquivo enviado permanece restrito ao fluxo de análise gerencial.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm leading-6 text-[#627D98]">
            <p>• Formatos aceitos: PDF, JPG, JPEG ou PNG.</p>
            <p>• Tamanho máximo: 5 MB.</p>
            <p>• Arquivos são validados antes do envio e podem ser removidos.</p>
            <p>• Não inclua biometria facial, senha ou dados sensíveis desnecessários.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimeOffMobileExperience;
