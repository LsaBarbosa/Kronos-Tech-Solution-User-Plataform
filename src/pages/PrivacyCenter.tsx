import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { APP_PATHS } from "@/config/app-routes";
import { toast } from "@/hooks/use-toast";
import ExportConfirmationModal from "@/components/privacy/ExportConfirmationModal";
import ExportManifestDisplay, {
  type ExportManifest,
} from "@/components/privacy/ExportManifestDisplay";
import PrivacyDesktop from "@/components/privacy-center/PrivacyDesktop";
import PrivacyMobile from "@/components/privacy-center/PrivacyMobile";
import { usePrivacyResponsiveMode } from "@/components/privacy-center/usePrivacyResponsiveMode";
import { exportMyData, listLgpdRequests } from "@/service/lgpd.service";
import { getServiceErrorMessage } from "@/service/helpers/service-error.helper";
import { useAuth } from "@/context/AuthContext";

const TOTAL_LGPD_RIGHTS = 12;

const PrivacyCenter = () => {
  const navigate = useNavigate();
  const { isDesktop } = usePrivacyResponsiveMode();
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportManifest, setExportManifest] = useState<ExportManifest | null>(null);

  const [requestsCount, setRequestsCount] = useState(0);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);

  const newRequestAnchorRef = useRef<HTMLDivElement | null>(null);

  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const handleBack = useCallback(() => navigate(APP_PATHS.dashboard), [navigate]);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingRequests(true);
    listLgpdRequests()
      .then((items) => {
        if (cancelled) return;
        setRequestsCount(items.length);
      })
      .catch(() => {
        if (cancelled) return;
        setRequestsCount(0);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingRequests(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const handleExportClick = useCallback(() => {
    setShowExportModal(true);
  }, []);

  const handleExportConfirmed = useCallback(async () => {
    setIsExporting(true);
    try {
      const exportResponse = await exportMyData();

      const json = JSON.stringify(exportResponse, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `meus-dados-${exportResponse.manifest.exportId || new Date().getTime()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Dados exportados com sucesso!");
      setExportManifest(exportResponse.manifest);
    } catch (error) {
      toast.error(getServiceErrorMessage(error, "Erro ao exportar dados. Tente novamente."));
    } finally {
      setIsExporting(false);
    }
  }, []);

  const handleDismissManifest = useCallback(() => {
    setExportManifest(null);
  }, []);

  const handleRequestSuccess = useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);

  const handleScrollToNewRequest = useCallback(() => {
    const element =
      newRequestAnchorRef.current ?? document.getElementById("nova-solicitacao-lgpd");
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const userName = user?.profile?.fullName ?? "";

  const nextActionLabel =
    requestsCount > 0
      ? `${requestsCount} solicitação(ões) registrada(s) · acompanhe ou abra uma nova`
      : "Exporte seus dados ou abra uma solicitação LGPD";

  const exportManifestSlot = exportManifest ? (
    <ExportManifestDisplay manifest={exportManifest} onDismiss={handleDismissManifest} />
  ) : null;

  return (
    <PageShell
      sidebarOpen={sidebarOpen}
      toggleSidebar={handleToggleSidebar}
      mainClassName="pt-24 sm:pt-32 mobile-container pb-36 sm:pb-12 space-y-6 sm:space-y-8 relative z-10 overflow-x-hidden"
    >
      <div ref={newRequestAnchorRef} id="nova-solicitacao-lgpd" className="sr-only" />

      <ExportConfirmationModal
        open={showExportModal}
        onOpenChange={setShowExportModal}
        onConfirm={handleExportConfirmed}
      />

      {isDesktop ? (
        <PrivacyDesktop
          userName={userName}
          totalRights={TOTAL_LGPD_RIGHTS}
          totalRequests={requestsCount}
          isLoadingRequests={isLoadingRequests}
          refreshKey={refreshKey}
          isExporting={isExporting}
          onExport={handleExportClick}
          onNewRequest={handleScrollToNewRequest}
          onRequestSuccess={handleRequestSuccess}
          onBack={handleBack}
          exportManifestSlot={exportManifestSlot}
        />
      ) : (
        <PrivacyMobile
          userName={userName}
          totalRights={TOTAL_LGPD_RIGHTS}
          totalRequests={requestsCount}
          isLoadingRequests={isLoadingRequests}
          refreshKey={refreshKey}
          isExporting={isExporting}
          onExport={handleExportClick}
          onRequestSuccess={handleRequestSuccess}
          onNewRequest={handleScrollToNewRequest}
          onBack={handleBack}
          exportManifestSlot={exportManifestSlot}
          nextActionLabel={nextActionLabel}
        />
      )}
    </PageShell>
  );
};

export default PrivacyCenter;
