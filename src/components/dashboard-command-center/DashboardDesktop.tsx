import { useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckinDashboardCard } from "@/components/checkin/CheckinDashboardCard";
import DashboardHero from "./DashboardHero";
import DashboardMetricStrip from "./DashboardMetricStrip";
import DashboardOperationalClock from "./DashboardOperationalClock";
import DashboardProfilePanel from "./DashboardProfilePanel";
import DashboardNoticeList from "./DashboardNoticeList";
import DashboardPendingPanel from "./DashboardPendingPanel";
import type {
  DashboardCommandCenterActions,
  DashboardCommandCenterData,
} from "./dashboard-command-center.types";

const PENDING_PANEL_ID = "dashboard-pending-panel";

interface DashboardDesktopProps {
  data: DashboardCommandCenterData;
  actions: DashboardCommandCenterActions;
}

const SkeletonStrip = () => (
  <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <Card key={index} className="border-border/70 shadow-sm">
        <CardContent className="space-y-3 px-4 py-5">
          <div className="h-10 w-10 animate-pulse rounded-xl bg-[#E2E8F0]" />
          <div className="h-3 w-24 animate-pulse rounded-full bg-[#E2E8F0]" />
          <div className="h-5 w-32 animate-pulse rounded-full bg-[#E2E8F0]" />
        </CardContent>
      </Card>
    ))}
  </div>
);

const DashboardDesktop = ({ data, actions }: DashboardDesktopProps) => {
  const handleScrollToPending = useCallback(() => {
    const target = document.getElementById(PENDING_PANEL_ID);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 lg:space-y-8">
      <DashboardHero
        variant="desktop"
        isLoading={data.isLoading}
        profileUnavailable={data.profileUnavailable}
        fullName={data.userData?.fullName}
        roleLabel={data.roleLabel}
        onPrimaryAction={actions.goToRelatorio}
        onSecondaryAction={actions.goToPerfil}
      />

      {data.isLoading ? (
        <SkeletonStrip />
      ) : (
        <DashboardMetricStrip
          variant="desktop"
          data={data}
          onJornadaClick={actions.goToRelatorio}
          onPendingClick={handleScrollToPending}
          onWarningClick={data.handleWarningClick}
          onProfileClick={actions.goToPerfil}
        />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardOperationalClock variant="desktop" />
        </div>
        <DashboardProfilePanel
          variant="desktop"
          data={data}
          onOpenProfile={actions.goToPerfil}
          onOpenEmpresa={data.isCto ? actions.goToEmpresa : undefined}
        />
      </div>

      <CheckinDashboardCard />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardNoticeList
          warnings={data.newWarnings}
          isManager={data.isManager}
          onOpenWarnings={() => void data.handleWarningClick()}
          onCreateWarning={actions.goToCriarAviso}
        />
        <div id={PENDING_PANEL_ID} className="scroll-mt-28">
          <DashboardPendingPanel
            data={data}
            onApprovalClick={actions.goToApuracaoHoras}
            onVacationApprovalClick={actions.goToFerias}
            onTimeOffApprovalClick={actions.goToAprovacoesAbono}
            onMeusDocumentos={actions.goToMeusDocumentos}
            onEnviarDocumento={actions.goToEnviarDocumentoColaborador}
            onSolicitarFerias={actions.goToSolicitarFerias}
            onSolicitarAbono={actions.goToSolicitarAbono}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardDesktop;
