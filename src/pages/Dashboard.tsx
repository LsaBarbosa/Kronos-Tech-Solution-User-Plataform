import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { APP_PATHS } from "@/config/app-routes";
import DashboardDesktop from "@/components/dashboard-command-center/DashboardDesktop";
import DashboardMobile from "@/components/dashboard-command-center/DashboardMobile";
import { useDashboardResponsiveMode } from "@/components/dashboard-command-center/useDashboardResponsiveMode";
import type {
  DashboardCommandCenterActions,
  DashboardCommandCenterData,
} from "@/components/dashboard-command-center/dashboard-command-center.types";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useVacationCount } from "@/hooks/useVacationCount";
import { useTimeOffCount } from "@/hooks/useTimeOffCount";
import { getRoleDisplayName } from "@/types/dashboard";

const Dashboard = () => {
  const navigate = useNavigate();
  const { isDesktop } = useDashboardResponsiveMode();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSalary, setShowSalary] = useState(false);

  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const toggleSalary = useCallback(() => setShowSalary((prev) => !prev), []);

  const {
    userData,
    isLoading,
    pendingApprovalsCount,
    newWarnings,
    hasApprovalPermission,
    handleWarningClick,
  } = useDashboardData();

  const { pendingVacationCount, isLoadingVacationCount } = useVacationCount(hasApprovalPermission);
  const { pendingTimeOffCount, isLoadingTimeOffCount } = useTimeOffCount(hasApprovalPermission);

  const role = userData?.role ?? "";
  const roleLabel = getRoleDisplayName(role);
  const isCto = role === "CTO";
  const isManager = role === "MANAGER";
  const isPartner = role === "PARTNER" || (!isCto && !isManager);
  const totalPendingCount =
    pendingApprovalsCount + pendingVacationCount + pendingTimeOffCount;
  const countsAreLoading = Boolean(isLoadingVacationCount || isLoadingTimeOffCount);
  const profileUnavailable = !isLoading && !userData;

  const data: DashboardCommandCenterData = useMemo(
    () => ({
      userData,
      isLoading,
      profileUnavailable,
      roleLabel,
      isCto,
      isManager,
      isPartner,
      pendingApprovalsCount,
      pendingVacationCount,
      pendingTimeOffCount,
      totalPendingCount,
      countsAreLoading,
      hasApprovalPermission,
      newWarnings,
      showSalary,
      toggleSalary,
      handleWarningClick,
    }),
    [
      countsAreLoading,
      handleWarningClick,
      hasApprovalPermission,
      isCto,
      isLoading,
      isManager,
      isPartner,
      newWarnings,
      pendingApprovalsCount,
      pendingTimeOffCount,
      pendingVacationCount,
      profileUnavailable,
      roleLabel,
      showSalary,
      toggleSalary,
      totalPendingCount,
      userData,
    ]
  );

  const actions: DashboardCommandCenterActions = useMemo(
    () => ({
      goToRelatorio: () => navigate(APP_PATHS.relatorioDetalhado),
      goToPerfil: () => navigate(APP_PATHS.usuario),
      goToAvisos: () => navigate(APP_PATHS.avisos),
      goToCriarAviso: () => navigate(APP_PATHS.criarAviso),
      goToEmpresa: () => navigate(APP_PATHS.empresa),
      goToApuracaoHoras: () => navigate(APP_PATHS.apuracaoHoras),
      goToFerias: () => navigate(APP_PATHS.ferias),
      goToAprovacoesAbono: () => navigate(APP_PATHS.aprovacoesAbono),
      goToMeusDocumentos: () => navigate(APP_PATHS.meusDocumentos),
      goToEnviarDocumentoColaborador: () => navigate(APP_PATHS.enviarDocumentoColaborador),
      goToSolicitarFerias: () => navigate(APP_PATHS.solicitarFerias),
      goToSolicitarAbono: () => navigate(APP_PATHS.solicitarAbono),
      goToEspelhoPonto: () => navigate(APP_PATHS.espelhoPonto),
      goToDashboard: () => navigate(APP_PATHS.dashboard),
    }),
    [navigate]
  );

  return (
    <PageShell
      sidebarOpen={sidebarOpen}
      toggleSidebar={handleToggleSidebar}
      withBackground={false}
      mainClassName="pt-24 sm:pt-28 mobile-container pb-32 sm:pb-12 px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 relative z-10 bg-[#F8FAFC] overflow-x-hidden"
    >
      {isDesktop ? (
        <DashboardDesktop data={data} actions={actions} />
      ) : (
        <DashboardMobile data={data} actions={actions} />
      )}
    </PageShell>
  );
};

export default Dashboard;
