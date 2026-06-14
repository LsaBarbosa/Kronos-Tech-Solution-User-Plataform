import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { APP_PATHS } from "@/config/app-routes";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { VacationRequestStep, VacationRequestViewModel } from "../types";
import { mapManagerOptionToDisplay } from "../mappers/vacation-request.mapper";
import { getVacationPeriodSummary } from "../utils/vacation-date-utils";
import MobileVacationHeader from "./MobileVacationHeader";
import MobileVacationStepper from "./MobileVacationStepper";
import MobileDateStep from "./MobileDateStep";
import MobileManagerStep from "./MobileManagerStep";
import MobileReviewStep from "./MobileReviewStep";
import MobileStickyActionBar from "./MobileStickyActionBar";

interface VacationRequestMobileProps {
  viewModel: VacationRequestViewModel;
}

const VacationRequestMobile = ({ viewModel }: VacationRequestMobileProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState<VacationRequestStep>("period");

  const summary = getVacationPeriodSummary(viewModel.startDate, viewModel.endDate);
  const currentPeriodLabel = summary.periodLabel;
  const selectedManagerDisplay = viewModel.selectedManager ? mapManagerOptionToDisplay(viewModel.selectedManager) : undefined;

  const goBackOrReset = () => {
    if (activeStep === "period") {
      viewModel.reset();
      return;
    }

    if (activeStep === "manager") {
      setActiveStep("period");
      return;
    }

    setActiveStep("manager");
  };

  const handlePrimaryAction = () => {
    if (activeStep === "period") {
      if (!summary.isValid) {
        return;
      }
      setActiveStep("manager");
      return;
    }

    if (activeStep === "manager") {
      if (!viewModel.selectedManager) {
        return;
      }
      setActiveStep("review");
      return;
    }

    viewModel.submit();
  };

  const sessionName = user?.profile?.fullName ?? user?.account.username ?? "Sessão ativa";
  const sessionRole = user?.role ?? "Usuário";
  const initials = sessionName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F8FAFC] text-[#0F172A]">
      <div className="absolute inset-0">
        <div className="absolute -left-16 top-0 h-52 w-52 rounded-full bg-[#22D3EE]/10 blur-3xl" />
        <div className="absolute right-[-4rem] top-24 h-56 w-56 rounded-full bg-[#2563EB]/10 blur-3xl" />
      </div>

      <main className="relative mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 pb-36 pt-4">
        <MobileVacationHeader
          title="Solicitar férias"
          subtitle="Fluxo guiado para aprovação"
        />

        <div className="flex items-center justify-between rounded-[24px] border border-[#E2E8F0] bg-white px-4 py-3 shadow-[0_14px_36px_rgba(16,26,51,0.08)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563EB] text-sm font-semibold text-white">
              {initials || "K"}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0F172A]">{sessionName}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-[#64748B]">{sessionRole}</p>
            </div>
          </div>
          <Badge variant="outline" className="border-[#BFDBFE] bg-[#EFF6FF] text-[#1E3A8A]">
            Seguro
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="rounded-[28px] bg-[#0B1220] px-5 py-6 text-white shadow-[0_24px_70px_rgba(11,18,32,0.24)]">
            <p className="text-3xl font-semibold tracking-tight">Planeje seu descanso</p>
            <p className="mt-2 text-sm leading-6 text-[#DCE7F5]">
              Escolha período, manager e revise antes de enviar.
            </p>
          </div>

          <MobileVacationStepper value={activeStep} onChange={setActiveStep} />

          <div className={cn(activeStep !== "period" && "hidden")}>
            <MobileDateStep
              startDate={viewModel.startDate}
              endDate={viewModel.endDate}
              dayCount={viewModel.dayCount}
              businessDays={viewModel.businessDays}
              weekendCount={viewModel.weekendCount}
              validationMessage={viewModel.validationMessage}
              onStartDateChange={viewModel.setStartDate}
              onEndDateChange={viewModel.setEndDate}
            />
          </div>

          <div className={cn(activeStep !== "manager" && "hidden")}>
            <MobileManagerStep
              managerOptions={viewModel.managerOptions}
              managerId={viewModel.managerId}
              selectedManager={viewModel.selectedManager}
              isLoadingManagers={viewModel.isLoadingManagers}
              managerErrorMessage={viewModel.managerErrorMessage}
              onManagerChange={viewModel.setManagerId}
            />
          </div>

          <div className={cn(activeStep !== "review" && "hidden")}>
            <MobileReviewStep
              summary={summary}
              startLabel={viewModel.startDate ? summary.startLabel : undefined}
              endLabel={viewModel.endDate ? summary.endLabel : undefined}
              managerLabel={selectedManagerDisplay?.displayName}
              validationMessage={viewModel.validationMessage ?? viewModel.submitErrorMessage}
              successCreatedIds={viewModel.successCreatedIds}
            />
          </div>
        </div>
      </main>

      <MobileStickyActionBar
        activeStep={activeStep}
        periodLabel={currentPeriodLabel}
        canAdvance={summary.isValid && (activeStep === "period" || Boolean(viewModel.selectedManager))}
        canSubmit={viewModel.canSubmit}
        isSubmitting={viewModel.isSubmitting}
        onPrimaryAction={handlePrimaryAction}
        onSecondaryAction={goBackOrReset}
        onReset={viewModel.reset}
        hasSuccess={Boolean(viewModel.successCreatedIds?.length)}
      />
    </div>
  );
};

export default VacationRequestMobile;
