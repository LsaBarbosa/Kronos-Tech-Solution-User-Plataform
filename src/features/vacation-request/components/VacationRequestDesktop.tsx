import { useNavigate } from "react-router-dom";
import { CalendarRange, Home, ShieldCheck, TreePalm, UserRound } from "lucide-react";
import { APP_PATHS } from "@/config/app-routes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VacationRequestViewModel } from "../types";
import { mapManagerOptionToDisplay } from "../mappers/vacation-request.mapper";
import VacationHero from "./VacationHero";
import VacationPeriodPlanner from "./VacationPeriodPlanner";
import VacationReviewPanel from "./VacationReviewPanel";
import VacationRulesCard from "./VacationRulesCard";
import { formatVacationDate, getVacationPeriodSummary } from "../utils/vacation-date-utils";

interface VacationRequestDesktopProps {
  viewModel: VacationRequestViewModel;
}

const DesktopRailButton = ({
  icon,
  label,
  onClick,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex h-14 w-14 items-center justify-center rounded-[18px] border transition-colors",
      active
        ? "border-[#22D3EE] bg-[#2563EB] text-white shadow-[0_12px_30px_rgba(37,99,235,0.28)]"
        : "border-white/10 bg-white/5 text-[#BFD4FF] hover:border-white/20 hover:bg-white/10 hover:text-white"
    )}
    title={label}
    aria-label={label}
  >
    {icon}
  </button>
);

const VacationRequestDesktop = ({ viewModel }: VacationRequestDesktopProps) => {
  const navigate = useNavigate();

  const summary = getVacationPeriodSummary(viewModel.startDate, viewModel.endDate);
  const selectedManagerDisplay = viewModel.selectedManager ? mapManagerOptionToDisplay(viewModel.selectedManager) : undefined;

  const scrollToRules = () => {
    document.getElementById("vacation-rules")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F8FAFC] text-[#0F172A]">
      <div className="absolute inset-0">
        <div className="absolute left-[-5rem] top-[-4rem] h-72 w-72 rounded-full bg-[#22D3EE]/10 blur-3xl" />
        <div className="absolute right-[-4rem] top-32 h-96 w-96 rounded-full bg-[#2563EB]/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[#1E3A8A]/8 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-[92px] shrink-0 flex-col border-r border-white/10 bg-[#0B1220] py-4 text-white shadow-[0_24px_70px_rgba(11,18,32,0.24)] lg:flex">
          <div className="flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#2563EB] text-lg font-semibold text-white shadow-[0_16px_40px_rgba(37,99,235,0.32)]">
              K
            </div>
          </div>

          <div className="mt-8 flex flex-1 flex-col items-center gap-3">
            <DesktopRailButton
              icon={<Home className="h-5 w-5" />}
              label="Início"
              onClick={() => navigate(APP_PATHS.dashboard)}
            />
            <DesktopRailButton
              icon={<CalendarRange className="h-5 w-5" />}
              label="Solicitar férias"
              onClick={() => navigate(APP_PATHS.solicitarFerias)}
              active
            />
            <DesktopRailButton
              icon={<UserRound className="h-5 w-5" />}
              label="Perfil"
              onClick={() => navigate(APP_PATHS.usuario)}
            />
            <DesktopRailButton
              icon={<ShieldCheck className="h-5 w-5" />}
              label="Privacidade"
              onClick={() => navigate(APP_PATHS.privacidade)}
            />
          </div>

          <div className="flex items-center justify-center pb-4">
            <DesktopRailButton
              icon={<TreePalm className="h-5 w-5" />}
              label="Férias"
              onClick={() => navigate(APP_PATHS.solicitarFerias)}
              active
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1">


          <main className="relative mx-auto max-w-[1560px] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1180px]">
              <VacationHero
                title="Planeje seu período de descanso"
                subtitle="Escolha datas futuras, selecione o gestor responsável e revise o impacto antes de enviar para aprovação."
                metrics={[]}
                onPrimaryAction={scrollToRules}
                primaryActionLabel="Ver regras"
              />

              {viewModel.successCreatedIds?.length ? (
                <div className="mt-6 rounded-[24px] border border-[#B7E4C7] bg-[#DCFCE7] p-4 text-sm leading-6 text-[#166534] shadow-[0_16px_40px_rgba(22,163,74,0.12)]">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4" />
                    <p>
                      Solicitação enviada para análise. {viewModel.successCreatedIds.length} dias registrados para aprovação.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex justify-center">
              <div className="w-full max-w-[1180px]">
                <VacationPeriodPlanner
                  startDate={viewModel.startDate}
                  endDate={viewModel.endDate}
                  managerId={viewModel.managerId}
                  managerOptions={viewModel.managerOptions}
                  selectedManager={viewModel.selectedManager}
                  isLoadingManagers={viewModel.isLoadingManagers}
                  isSubmitting={viewModel.isSubmitting}
                  managerErrorMessage={viewModel.managerErrorMessage}
                  validationMessage={viewModel.validationMessage}
                  onStartDateChange={viewModel.setStartDate}
                  onEndDateChange={viewModel.setEndDate}
                  onManagerChange={viewModel.setManagerId}
                />
              </div>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_480px]">
              <VacationRulesCard className="h-fit" />

              <VacationReviewPanel
                summary={summary}
                startLabel={viewModel.startDate ? formatVacationDate(viewModel.startDate) : undefined}
                endLabel={viewModel.endDate ? formatVacationDate(viewModel.endDate) : undefined}
                managerLabel={selectedManagerDisplay?.displayName}
                isSubmitting={viewModel.isSubmitting}
                canSubmit={viewModel.canSubmit}
                validationMessage={viewModel.validationMessage ?? viewModel.submitErrorMessage}
                successCreatedIds={viewModel.successCreatedIds}
                onSubmit={viewModel.submit}
                onScrollToRules={scrollToRules}
                className="h-fit"
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default VacationRequestDesktop;
